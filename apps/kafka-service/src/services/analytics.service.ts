import prisma from "@packages/libs/prisma";




export const updateUserAnalytics = async (event: any) => {
    try {
        const existingData = await prisma.userAnalytics.findUnique({
            where: {
                userId: event.userId,
            },
            select: {
                actions: true
            },
        });

        let updatedActions: any = existingData?.actions || [];

        const actionExisits = updatedActions.some((entry: any) =>
            entry.productId === event.productId && entry.action === event.action
        )

        // Always store 'product_view' for recommendations
        if (event.action === 'product_view') {
            updatedActions.push({
                productId: event?.productId,
                shopId: event.shopId,
                action: event.action,
                timestamp: new Date(),
            })
        }

        else if (['add_to_cart', "add_to_wishlist"].includes(event.action) && !actionExisits) {
            updatedActions.push({
                productId: event?.productId,
                shopId: event.shopId,
                action: event?.action,
                timestamp: new Date(),
            })
        }

        //Remove 'add_to_cart' when 'remove_from_cart' is tiggered
        else if (event.action === 'remove_from_cart') {
            updatedActions = updatedActions.filter(
                (entry: any) => !(
                    entry.productId === event.productId &&
                    entry.action === 'add_to_cart'
                )
            )
        }

        //Remove 'add_to_wishlist' when 'remove_from_wishlist' is tiggered
        else if (event.action === 'remove_from_wishlist') {
            updatedActions = updatedActions.filter(
                (entry: any) => !(
                    entry.productId === event.productId &&
                    entry.action === 'add_to_wishlist'
                )
            )
        }

        // keep only the last 100 actions (prevent storage overload)
        if (updatedActions.length > 100) {
            updatedActions = updatedActions.slice(-100);
        }

        const extraFields: Record<string, any> = {};

        if (event.country) {
            extraFields.country = event.country;
        }

        if (event.city) {
            extraFields.city = event.city;
        }

        if (event.device) {
            extraFields.device = typeof event.device === 'string'
                ? event.device
                : event.device.deviceInfo || 'Unknown';
        }

        await prisma.userAnalytics.upsert({
            where: { userId: event.userId },
            update: {
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields
            },
            create: {
                userId: event?.userId,
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields,
            }
        })

        await updateProductAnalytics(event);

    } catch (error) {
        console.log("Error storing user analytics :", error);
    }
}


export const updateProductAnalytics = async (event: any) => {
    try {
        if (!event.productId) return;

        //Define update fields dynamically
        const updateFields: any = {};

        if (event.action === 'product_view') 
            updateFields.views = { increment: 1 };

        if (event.action === 'add_to_cart')
            updateFields.cartAdds = { increment: 1 };

        if (event.action === 'remove_from_cart')
            updateFields.cartAdds = { decrement: 1 };

        if (event.action === 'add_to_wishlist')
            updateFields.wishListAdds = { increment: 1 };

        if (event.action === 'remove_from_wishlist')
            updateFields.wishListAdds = { decrement: 1 };

        if (event.action === 'purchase')
            updateFields.purchases = { increment: 1 };

        //update or create Product analytics

        await prisma.productAnalytics.upsert({
            where: {
                productId: event.productId
            },
            update: {
                lastViewedAt: new Date(),
                ...updateFields,
            },
            create: {
                productId: event.productId,
                shopId: event.shopId || null,
                views: event.action === 'product_view' ? 1 : 0,
                cartAdds: event.action === 'add_to_cart' ? 1 : 0,
                wishListAdds: event.action === 'add_to_wishlist' ? 1 : 0,
                purchases: event.action === 'purchase' ? 1 : 0,
                lastViewedAt: new Date(),
            }
        });

        console.log("Product analytics updated for:", event.productId);
    } catch (error) {
        console.log("Error updating product analytics:", error);
    }
}