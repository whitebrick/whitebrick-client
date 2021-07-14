import React, { useState } from 'react';
import { Pane, Tab, Tablist } from 'evergreen-ui';

type TabType = {
  title: string;
  element?: React.ReactNode;
  noPane?: boolean;
};

type TabsType = {
  items: TabType[];
};

const Tabs = ({ items }: TabsType) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <Pane>
      <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
        {items.map((tab, index) => (
          <Tab
            key={tab.title}
            id={tab.title}
            onSelect={() => setSelectedIndex(index)}
            isSelected={index === selectedIndex}
            aria-controls={`panel-${tab.title}`}>
            {tab.title}
          </Tab>
        ))}
      </Tablist>
      <React.Fragment>
        {items.map((tab, index) => (
          <Pane
            key={tab.title}
            id={`panel-${tab.title}`}
            role="tabpanel"
            aria-labelledby={tab.title}
            aria-hidden={index !== selectedIndex}
            display={index === selectedIndex ? 'block' : 'none'}>
            {tab.element}
          </Pane>
        ))}
      </React.Fragment>
    </Pane>
  );
};

export default Tabs;
