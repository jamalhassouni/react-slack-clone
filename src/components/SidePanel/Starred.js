import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class Starred extends Component {
  state = {
    activeChannel: "",
    starredChannel: []
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  displayChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));

  render() {
    const { starredChannel } = this.state;
    return (
      <Menu.Menu>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="star" /> STARRED
            </span>{" "}
            ({starredChannel.length}){" "}
            <Icon name="add" onClick={this.openModal} />
          </Menu.Item>

          {this.displayChannels(starredChannel)}
        </Menu.Menu>
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Starred);
