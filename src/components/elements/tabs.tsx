import React, { useState } from 'react';

type ItemType = {
  title: React.ReactElement;
  element?: React.ReactNode;
  onClick?: () => void;
};

type TabsType = {
  items: Array<ItemType>;
};

const Tabs = ({ items }: TabsType) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <React.Fragment>
      <div className="mt-4">
        <div className="card d-flex">
          <div className="row m-0">
            {items.map((item, index) => {
              return (
                <div
                  className={`col-2 p-2 text-center rounded-0 ${
                    tabIndex === index && 'bg-primary text-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setTabIndex(index);
                    item.onClick && item.onClick();
                  }}>
                  <h6>{item.title}</h6>
                </div>
              );
            })}
          </div>
        </div>
        <div>{items[tabIndex].element && items[tabIndex].element}</div>
      </div>
    </React.Fragment>
  );
};

export default Tabs;
