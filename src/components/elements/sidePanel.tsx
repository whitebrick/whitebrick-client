import React, { FormEvent } from 'react';
import {
  SideSheet,
  Heading,
  Pane,
  Card,
  Button,
  Paragraph,
} from 'evergreen-ui';

type SidePanelPropsType = {
  name: string;
  description?: string;
  show: boolean;
  setShow: (value: boolean) => void;
  setErrors?: (value: null) => void;
  values?: any;
  onSave?: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  validateForm?: (values: any) => void;
  renderSaveButton?: boolean;
};

const defaultProps = {
  description: null,
  onSave: null,
  isLoading: false,
  renderSaveButton: true,
  validateForm: null,
  values: {},
  setErrors: () => ({}),
};

const SidePanel = ({
  name,
  description = null,
  show,
  setShow,
  setErrors,
  onSave,
  values,
  children,
  isLoading,
  validateForm,
  renderSaveButton = true,
}: SidePanelPropsType) => {
  return (
    <div>
      <SideSheet
        isShown={show}
        onCloseComplete={() => {
          setShow(false);
          setErrors(null);
        }}
        preventBodyScrolling
        containerProps={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
        }}>
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            validateForm(values);
            onSave();
          }}>
          <Pane
            display="flex"
            zIndex={1}
            flexShrink={0}
            elevation={0}
            backgroundColor="white">
            <Pane
              padding={16}
              flex={1}
              alignItems="center"
              display="flex"
              borderBottom="muted">
              <Heading size={600}>{name}</Heading>
              {description && (
                <Paragraph size={400} color="muted">
                  {description}
                </Paragraph>
              )}
            </Pane>
            {renderSaveButton && (
              <Pane
                padding={16}
                alignItems="center"
                display="flex"
                borderBottom="muted">
                <Button
                  type="submit"
                  appearance="primary"
                  isLoading={isLoading}>
                  Save
                </Button>
              </Pane>
            )}
          </Pane>
          <Pane flex="1" overflowY="scroll" background="tint1" padding={16}>
            <Card
              backgroundColor="white"
              elevation={0}
              display="flex"
              alignItems="center"
              paddingY={50}
              paddingX={10}
              justifyContent="center">
              {children}
            </Card>
          </Pane>
        </form>
      </SideSheet>
    </div>
  );
};

SidePanel.defaultProps = defaultProps;
export default SidePanel;
