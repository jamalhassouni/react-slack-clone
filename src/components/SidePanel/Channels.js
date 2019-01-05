import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from "semantic-ui-react";

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channel: null,
    channels: [],
    activeChannel: "",
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("typing"),
    notifications: [],
    modal: false,
    firstLoad: true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState(
        {
          channels: loadedChannels
        },
        () => this.setFirstChannel()
      );
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channleId => {
    this.state.messagesRef.child(channleId).on("value", snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channleId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channleId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      notification => notification.id === channleId
    );

    if (index !== -1) {
      if (channleId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnonTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channleId,
        total: snap.numChildren(),
        lastKnonTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off();
    });
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added successfully!");
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  changeChannel = channel => {
    // set active channel
    this.setActiveChannel(channel);
    // remove typing
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    // clear notification
    this.clearNotifications();
    // set current channel
    this.props.setCurrentChannel(channel);
    // set private channel
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    );
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnonTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  getNotificationCount = channel => {
    let count = 0;
    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>

          {this.displayChannels(channels)}
        </Menu.Menu>

        {/*  Add Channel modal */}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>

          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}
export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
