import "./Tabs.css";

interface ITabs {
  titles: string[];
  activeTab: string;
  setActiveTab: (title: string) => void;
}

export const Tabs = ({ titles, activeTab, setActiveTab }: ITabs) => {
  return (
    <div className="flex w-full flex-col items-start justify-between gap-2 border-b-1 border-edge-primary text-write-secundary md:flex-row md:gap-0">
      {titles.map((title: string) => (
        <div
          key={title}
          className={`container_tab ${activeTab === title ? "border-primary transition-colors duration-500 ease-linear active:border-primary" : ""} `}
          onClick={() => setActiveTab(title)}
        >
          <p>{title}</p>
        </div>
      ))}
    </div>
  );
};
