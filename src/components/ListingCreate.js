import React, { Component } from 'react'
import origin from '../services/origins'

import Form from 'react-jsonschema-form'
import Dropzone from 'react-dropzone'
import { Button } from 'reactstrap';
import Modal from 'react-modal';

import '../assets/css/CreateListing.css';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class ListingCreate extends Component {

  constructor(props) {
    super(props)

    this.MAX_UPLOAD_BYTES = (2e6 - 1e5)

    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      PREVIEW: 3,
      METAMASK: 4,
      PROCESSING: 5,
      SUCCESS: 6,
      ERROR: 7
    }

    this.schemaList = [
      { type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg' },
      { type: 'housing', name: 'Housing', 'img': 'housing.jpg' },
      { type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg' },
      { type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg' },
      { type: 'services', name: 'Services', 'img': 'services.jpg' },
      { type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg' },
    ]

    this.state = {
      step: this.STEP.DETAILS,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: {
        type: "object",
        properties: {
          title: { type: "string", title: "Title", default: "A new task" },
          done: { type: "boolean", title: "Done?", default: false }
        }
      },
      schemaFetched: false,
      formListing: { formData: null },
      preview: [],
      pictures: [],
      modalIsOpen: false
    }

    this.onDrop = this.onDrop.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmitListing = this.onSubmitListing.bind(this)
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this)
  }

  async onSubmitListing() {
    try {
      let { formListing, pictures } = this.state;
      formListing.formData.pictures = pictures;
      await origin.listings.create(formListing.formData, this.props.id)
    } catch (error) {
      console.error(error)
    }
  }

  resetToPreview() {
    this.setState({ step: this.STEP.PREVIEW })
  }

  onDrop(acceptedFiles) {
    let { preview, pictures } = this.state;

    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      preview.push(file.preview);
      reader.onload = () => {
        const fileAsBinaryString = reader.result;
        const data = btoa(fileAsBinaryString);
        pictures.push("data:image/png;base64," + data);
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      reader.readAsBinaryString(file);
    });

    this.setState({ preview, pictures });
  }

  onChange(formListing) {
    this.setState({ formListing: formListing });
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    const { selectedSchema, preview, step } = this.state
    const schema = {
      title: "Create your listing",
      type: "object",
      properties: {
        name: { type: "string", title: "Name" },
        category: { type: "string", title: "Category" },
        description: { type: "string", title: "Description" },
        location: { type: "string", title: "Location" },
        price: { type: "number", title: "Price" }
      }
    };

    const uiSchema = {
      name: {
        classNames: "name"
      },
      category: {
        classNames: "category"
      },
      description: {
        "ui:widget": "textarea",
        "ui:options": {
          rows: 5
        }
      }
    }
    return (
      <div className="container listing-form">
        {this.state.step === this.STEP.DETAILS && selectedSchema &&
          <div className="step-container schema-details">
            <div className="row flex-sm-row-reverse">
              <div className="col-12">
                <Form
                  schema={schema}
                  uiSchema={uiSchema}
                  formData={this.state.formListing.formData}
                  onChange={this.onChange}
                  onSubmit={this.onListingSubmit}
                >
                  <p>Images</p>
                  <Dropzone className="dropzone" onDrop={this.onDrop}>
                    <p>Try dropping some files here, or click to select files to upload.</p>
                    <div className="preview">
                      {preview.map(picture => <img src={picture} />)}
                    </div>
                  </Dropzone>
                  <Button color="primary" onClick={this.openModal}>Submit</Button>
                  <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                  >

                    <h2 style={{ marginBottom: "40px" }} ref={subtitle => this.subtitle = subtitle}>Confirm</h2>
                    <button style={{ marginRight: "10px" }} onClick={this.onSubmitListing}>OK</button>
                    <button onClick={this.closeModal}>Cancel</button>
                  </Modal>
                </Form>
              </div>
              <div className="col-md-6">
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ListingCreate
