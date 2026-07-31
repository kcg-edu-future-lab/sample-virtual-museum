import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

type StateOfDispatch<D> =
  D extends Dispatch<SetStateAction<infer S>> ? S : never;
interface TabHeaderProps<D extends Dispatch<SetStateAction<any>>> extends PropsWithChildren{
  id: string;
  tabName: StateOfDispatch<D>;
  activeTab: string;
  setActiveTab: D;
}
export function TabHeader<D extends Dispatch<SetStateAction<any>>>(
  {id, tabName, activeTab, setActiveTab, children}: TabHeaderProps<D>){
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
