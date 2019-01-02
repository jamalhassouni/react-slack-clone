import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
export default class Channels extends Component {
  state = {
    channels: []
  };

  render() {
    const { channels } = this.state;
    return (
      <Menu.Menu>
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHANNELS
          </span>{" "}
          ({channels.length}) <Icon name="add" />
        </Menu.Item>

        {/* channels */}
      </Menu.Menu>
    );
  }
}
