import React, { ReactNode } from 'react'


interface Props {
  title: string;
  icon: ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void; 
  disabled?: boolean;
}

const SidebarItem = ({ title, icon, href, isActive, onClick, disabled }: Props) => {
  const itemClasses = `
    flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg 
    cursor-pointer transition hover:bg-[#2b2f31]
    ${isActive && 'bg-[#0f3158] scale-[0.98] fill-blue-200 hover:bg-[#0f3158d6]'}
    ${disabled && 'opacity-50 cursor-not-allowed'}
  `;
  const itemContent = (
    <>
      {icon}
      <h5 className="text-lg font-medium text-slate-200">{title}</h5>
    </>
  );
  if (href) {
    return (
      <a href={href} className="my-2 block">
        <div className={itemClasses}>{itemContent}</div>
      </a>
    );
  }
  return (
    <div className="my-2 block">
      <div className={itemClasses} onClick={!disabled ? onClick : undefined}>
        {itemContent}
      </div>
    </div>
  );
};

export default SidebarItem;