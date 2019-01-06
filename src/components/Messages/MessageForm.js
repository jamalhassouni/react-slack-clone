import React, { Component } from "react";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Button, Ref, Form, TextArea } from "semantic-ui-react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

export default class MessageForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    emojiPicker: false,
    style: null,
    textAreaStyle: {
      width: "92%"
    }
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutsidePicker);
  }
  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
    document.removeEventListener("mousedown", this.handleClickOutsidePicker);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.emojiPicker !== this.state.emojiPicker) {
      if (this.state.emojiPicker === true) {
        this.setState({
          style: {
            background: "transparent",
            border: 0
          },
          textAreaStyle: {
            width: "84%"
          }
        });
      } else {
        this.setState({
          style: null,
          textAreaStyle: {
            width: "92%"
          }
        });
      }
    }
  }

  handleClickOutsidePicker = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ emojiPicker: false });
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChane = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handletoggelPicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = ` ${oldMessage} ${emoji.colons} `;
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.children[1].focus(), 0);
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  handleKeyDown = event => {
    if (event.ctrlKey && event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, typingRef, user } = this.state;
    if (message) {
      this.setState({ loading: true });
      // send message
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
        })
        .catch(err => {
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };

  uploadFile = (file, metaData) => {
    const pathtoUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metaData)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.props.isProgressBarVisible(percentUploaded);
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(donwloadUrl => {
                this.sendFileMessage(donwloadUrl, ref, pathtoUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathtoUpload) => {
    ref
      .child(pathtoUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
      style,
      textAreaStyle
    } = this.state;
    return (
      <Segment className="message__form" style={style}>
        {emojiPicker && (
          <Ref innerRef={node => (this.wrapperRef = node)}>
            <Picker
              set="messenger"
              onSelect={this.handleAddEmoji}
              className="emojipicker"
              title="Pick your emoji"
              emoji="point_up"
            />
          </Ref>
        )}
        {/*  <Input
          fluid
          name="message"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChane}
          value={message}
          ref={node => (this.messageInputRef = node)}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "close" : null}
              onClick={this.handletoggelPicker}
            />
          }
          labelPosition="left"
          palceholder="Write your message"
          autoComplete="off"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
        /> */}
        <Form>
          <Ref innerRef={node => (this.messageInputRef = node)}>
            <Form.Field
              control={TextArea}
              value={message}
              fluid="true"
              name="message"
              onKeyDown={this.handleKeyDown}
              style={textAreaStyle}
              className={
                errors.some(error => error.message.includes("message"))
                  ? "error"
                  : ""
              }
              rows={2}
              onChange={this.handleChane}
              placeholder="Write your message"
              labelposition="left"
              label={
                <Button
                  icon={emojiPicker ? "close" : "add"}
                  content={emojiPicker ? "close" : null}
                  onClick={this.handletoggelPicker}
                />
              }
            />
          </Ref>
          <Button.Group icon widths="2">
            <Button
              onClick={this.sendMessage}
              color="orange"
              disabled={loading}
              content="Add Reply"
              labelPosition="left"
              icon="edit"
            />
            <Button
              color="teal"
              disabled={uploadState === "uploading"}
              onClick={this.openModal}
              content="Upload Media"
              labelPosition="right"
              icon="cloud upload"
            />
          </Button.Group>
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Form>
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}
