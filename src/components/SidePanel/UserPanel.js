import React, { Component } from "react";
import firebase from "../../firebase";
//prettier-ignore
import { Grid, Header, Icon, Dropdown, Image,Modal, Input, Button } from "semantic-ui-react";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false
  };

  dropDownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as
          <strong>{" " + this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    { key: "signout", text: <span onClick={this.handelSignout}>Sign Out</span> }
  ];

  handelSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  render() {
    const { user, modal } = this.state;
    const { primaryColor } = this.props;
    return (
      <Grid style={{ backgroundColor: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: "0" }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>SlackClone</Header.Content>
            </Header>
            {/* User Dropdown */}
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />

                    {user.displayName}
                  </span>
                }
                options={this.dropDownOptions()}
              />
            </Header>
          </Grid.Row>

          {/*    Change User Avatar Modal    */}

          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input fluid type="file" label="New Avatar" name="previewImage" />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/*  Image Preview */}
                    Image Preview
                  </Grid.Column>

                  <Grid.Column>
                    {/* Cropped Image Preview */}
                    Cropped Image Preview
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>

            <Modal.Actions>
              <Button color="green" inverted>
                <Icon name="save" /> Change Avatar
              </Button>

              <Button color="blue" inverted>
                <Icon name="image" /> Preview
              </Button>

              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
