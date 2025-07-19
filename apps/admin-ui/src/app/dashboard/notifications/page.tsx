import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import React from 'react';

const NotificationPage = () => {
  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <p className="text-gray-500">This page will display notifications related to the admin dashboard.</p>
        <div className="mt-1">
            <BreadCrumbs title='Notifications' />
        </div>
        
        <div className="mt-8">
            <p className="text-gray-400 text-center font-Poppins">No notifications yet.</p>
        </div>
        
    </div>
  )
}

export default NotificationPage