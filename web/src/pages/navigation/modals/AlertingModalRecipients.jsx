import React from 'react';
import PropTypes from 'prop-types';
import {Button, Input, List, Popover} from "antd";

const AlertingModalRecipients = ({onChange, label, config}) => (
  <List
    header={<div>
      {label}
      {config.enabled
        ? <>
          <Button onClick={() => onChange({...config, enabled: false})}>Disable</Button>
          <Popover
            placement="bottom"
            content={
              <Input.Search
                enterButton="Save"
                onSearch={value => onChange({
                  ...config,
                  items: (config.items || []).concat(value)
                })}
              />
            }
            title={null}
            trigger="click"
          >
            <Button>Add new</Button>
          </Popover>
        </>
        : <>
          <Button type="primary" onClick={() => onChange({...config, enabled: true})}>Enable</Button>
        </>
      }
    </div>
    }
    bordered
    dataSource={config.items || []}
    renderItem={item => (
      <List.Item
        actions={[
          <Button onClick={() => onChange({...config, items: config.items.filter(obj => obj !== item)})}>
            Delete
          </Button>
        ]}
      >
        {item}
      </List.Item>
    )}
  />
);

AlertingModalRecipients.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.any.isRequired,
  config: PropTypes.object.isRequired,
};

export default React.memo(AlertingModalRecipients);
