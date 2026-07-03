import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

interface TabHeaderProps extends PropsWithChildren{
  id: string;
  tabName: string;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<any>>;
}
export function TabHeader(
  {id, tabName, activeTab, setActiveTab, children}: TabHeaderProps){
  return <button
      id={id}
      className={`${tabName}Tab`}
      role="tab"
      style={{ color: activeTab === tabName ? undefined : '#6b7280' }}
      aria-selected={activeTab === tabName}
      aria-controls={`${tabName}-panel`}
      aria-label={tabName}
      onClick={() => setActiveTab(tabName)}
      >{children}</button>;
}
