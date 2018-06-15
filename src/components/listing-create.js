import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import origin from '../services/origins'

import Form from 'react-jsonschema-form'
import Modal from './modal'
import Dropzone from 'react-dropzone'

import '../assets/css/CreateListing.css';

class ListingCreate extends Component {

  constructor(props) {
    super(props)

    // This is non-ideal fix until IPFS can correctly return 443 errors
    // Server limit is 2MB, with 100K safety buffer
    this.MAX_UPLOAD_BYTES = (2e6 - 1e5)

    // Enum of our states
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
      {type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg'},
      {type: 'housing', name: 'Housing', 'img': 'housing.jpg'},
      {type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg'},
      {type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg'},
      {type: 'services', name: 'Services', 'img': 'services.jpg'},
      {type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg'},
    ]

    this.state = {
      step: this.STEP.DETAILS,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: {
        type: "object",
        properties: {
          title: {type: "string", title: "Title", default: "A new task"},
          done: {type: "boolean", title: "Done?", default: false}
        }
      },
      schemaFetched: false,
      formListing: {formData: null},
      preview: [],
      pictures: [],
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
    this.onDrop = this.onDrop.bind(this)
  }

  handleSchemaSelection() {
    fetch(`schemas/${this.state.selectedSchemaType}.json`)
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchema: schemaJson,
        schemaFetched: true,
        step: this.STEP.DETAILS
      })
      window.scrollTo(0, 0)
    })
  }

  onDetailsEntered(formListing) {
    // Helper function to approximate size of object in bytes
    function roughSizeOfObject( object ) {
      var objectList = []
      var stack = [object]
      var bytes = 0
      while (stack.length) {
        var value = stack.pop()
        if (typeof value === 'boolean') {
          bytes += 4
        } else if (typeof value === 'string') {
          bytes += value.length * 2
        } else if (typeof value === 'number') {
          bytes += 8
        }
        else if (typeof value === 'object'
          && objectList.indexOf(value) === -1)
        {
          objectList.push(value)
          for (var i in value) {
            if (value.hasOwnProperty(i)) {
              stack.push(value[i])
            }
          }
        }
      }
      return bytes
    }
    if (roughSizeOfObject(formListing.formData) > this.MAX_UPLOAD_BYTES) {
      this.props.showAlert("Your listing is too large. Consider using fewer or smaller photos.")
    } else {
      this.setState({
        formListing: formListing,
        step: this.STEP.PREVIEW
      })
      window.scrollTo(0, 0)
    }
  }

  async onSubmitListing(formListing, selectedSchemaType) {
    try {
      console.log(formListing)
      this.setState({ step: this.STEP.METAMASK })
      const transactionReceipt = await origin.listings.create(formListing.formData, selectedSchemaType)
      this.setState({ step: this.STEP.PROCESSING })
      // Submitted to blockchain, now wait for confirmation
      await origin.contractService.waitTransactionFinished(transactionReceipt.transactionHash)
      this.setState({ step: this.STEP.SUCCESS })
    } catch (error) {
      console.error(error)
      this.setState({ step: this.STEP.ERROR })
    }
  }

  resetToPreview() {
    this.setState({ step: this.STEP.PREVIEW })
  }

  onDrop(acceptedFiles) {
    let {preview, pictures} = this.state;

    console.log('preview', preview);
    console.log('pictures', pictures);


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

    this.setState({preview, pictures});
}

  render() {
    const { selectedSchema, preview } = this.state
    const schema = {
      title: "Create your listing",
      type: "object",
      properties: {
          name: {type: "string", title: "Name"},
        category: {type: "string", title: "Category"},
        description: {type: "string", title: "Description"},
        location: {type: "string", title: "Location"},
        price: {type: "number", title: "Price"}
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
        { this.state.step === this.STEP.DETAILS && this.state.selectedSchema &&
          <div className="step-container schema-details">
            <div className="row flex-sm-row-reverse">
              <div className="col-12">
                <h2>Create your listing</h2>
                <Form
                  schema={this.state.selectedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={this.state.formListing.formData}
                  onError={(errors) => console.log(`react-jsonschema-form errors: ${errors.length}`)}
                >
                  <div className="btn-container">
                    <button type="submit" className="float-right btn btn-primary">Continue</button>
                  </div>
                </Form>

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
                        {preview.map(picture => <img src={picture}/>)}
                    </div>
                  </Dropzone>
                    <button type="submit" className="float-center btn btn-secondary">Continue</button>
                </Form>
              </div>
              <div className="col-md-6">
              </div>
            </div>
          </div>
        }
        { (this.state.step >= this.STEP.PREVIEW) &&
          <div className="step-container listing-preview">
            {this.state.step === this.STEP.METAMASK &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation"/>
                </div>
                Confirm transaction<br />
                Press &ldquo;Submit&rdquo; in MetaMask window
              </Modal>
            }
            {this.state.step === this.STEP.PROCESSING &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation"/>
                </div>
                Uploading your listing<br />
                Please stand by...
              </Modal>
            }
            {this.state.step === this.STEP.SUCCESS &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/circular-check-button.svg" role="presentation"/>
                </div>
                Success
                <div className="button-container">
                  <Link to="/" className="btn btn-clear">See All Listings</Link>
                </div>
              </Modal>
            }
            {this.state.step === this.STEP.ERROR && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/flat_cross_icon.svg" role="presentation" />
                </div>
                There was a problem creating this listing.<br />See the console for more details.
                <div className="button-container">
                  <a
                    className="btn btn-clear"
                    onClick={e => {
                      e.preventDefault()
                      this.resetToPreview()
                    }}
                  >
                    OK
                  </a>
                </div>
              </Modal>
            )}
            <div className="row">
              <div className="col-md-7">
                <label className="create-step">STEP {Number(this.state.step)}</label>
                <h2>Preview your listing</h2>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
              <div className="col-md-5">
                <div className="info-box">
                  <div><h2>What happens next?</h2>When you hit submit, a JSON object representing your listing will be published to <a target="_blank" rel="noopener noreferrer" href="https://ipfs.io">IPFS</a> and the content hash will be published to a listing smart contract running on the Ethereum network.<br/><br/>Please review your listing before submitting. Your listing will appear to others just as it looks on the window to the left.</div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="btn-container">
                  <button className="btn btn-other float-left" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                    Back
                  </button>
                  <button className="btn btn-primary float-right"
                    onClick={() => this.onSubmitListing(this.state.formListing, this.state.selectedSchemaType)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ListingCreate
