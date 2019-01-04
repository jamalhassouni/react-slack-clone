import React, { Component } from "react";
import firebase from "../../firebase";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";

export default class ColorPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersRef: firebase.database().ref("users"),
      user: this.props.currentUser,
      modal: false,
      primary: "",
      secondary: ""
    };
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChanePrimary = color => this.setState({ primary: color.hex });
  handleChaneSecondary = color => this.setState({ secondary: color.hex });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };
  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        console.log("Color Add Successfully");
        this.closeModal();
      })
      .catch(err => console.error(err));
  };

  render() {
    const { modal, primary, secondary } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />

        {/* Color Picker Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose app Colors</Modal.Header>

          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <SliderPicker
                color={primary}
                onChange={this.handleChanePrimary}
                styles={{ default: { wrap: {} } }}
              />
            </Segment>
            <Segment inverted>
              <Label content="Secondary Color" />
              <SliderPicker
                color={secondary}
                onChange={this.handleChaneSecondary}
                styles={{ default: { wrap: {} } }}
              />
            </Segment>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>

            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}
