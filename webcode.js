/*import required modules*/
import { LightningElement, track,api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import accObj from '@salesforce/schema/Account';
import accFld from '@salesforce/schema/Contact.AccountId';
import nameFld from '@salesforce/schema/Account.Name';
import accWebsite from '@salesforce/schema/Account.Website';
import conObj from '@salesforce/schema/Contact';
import conNameFld from '@salesforce/schema/Contact.LastName';
import conFirstName from '@salesforce/schema/Contact.FirstName';
import conLastName from '@salesforce/schema/Contact.LastName';
import conEmail from '@salesforce/schema/Contact.Email';
import conPhone from '@salesforce/schema/Contact.Phone';
import conAccountId from '@salesforce/schema/Contact.accountId';
import {NavigationMixin} from 'lightning/navigation';
import uploadFile from '@salesforce/apex/FileUploaderClass.uploadFile'
export default class Webcode extends NavigationMixin(LightningElement) {
  /*variables declartion */
   accountName;
   website;
   accountId; 
   contactId; 
   firstName;
   lastName;
   emailId;
   phone;
   @api recordId;
   fileData;
   
   /*assign form element values to the variables declared */
   handleNameChange(event){ 
       if(event.target.name == 'accountName'){
           this.accountName = event.target.value;
        }  
       if(event.target.name == 'Website'){
            this.website = event.target.value;
       }           
   }
   contactChangeVal(event) {
        if(event.target.name=='First Name'){
            this.firstName = event.target.value;
        }
        if(event.target.name=='Last Name'){
            this.lastName = event.target.value;
        }
        if(event.target.name=='Email'){
            this.emailId = event.target.value;
        }
        if(event.target.name=='Phone'){
            this.phone = event.target.value;
        }    
    }
   
       /* This method is used to create a new Account and related Contact in
        salesforce based on the values entered by the user and naviagtes to
        the contact record detail page in View action*/
   saveAction() {
            const fields = {};
            fields[nameFld.fieldApiName] = this.accountName;
            fields[accWebsite.fieldApiName] = this.website;
            const accRecordInput = { apiName: accObj.objectApiName, fields};
      
       createRecord(accRecordInput)
           .then(account => {
               this.accountId = account.id;
              
               this.dispatchEvent(
                   new ShowToastEvent({
                       title: 'Success',
                       message: 'Account created',
                       variant: 'success',
                   }),
               );
                const fields_Contact = {};               
                fields_Contact[accFld.fieldApiName] = this.accountId;   
                fields_Contact[conEmail.fieldApiName] = this.emailId;
                fields_Contact[conFirstName.fieldApiName] = this.firstName;
                fields_Contact[conLastName.fieldApiName] = this.lastName;
                fields_Contact[conPhone.fieldApiName] = this.phone;
                const recordInput_Contact = { apiName: conObj.objectApiName,
                    fields : fields_Contact};

                createRecord(recordInput_Contact)
                .then(contact => {
                    this.contactId = contact.id;

                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: `Contact created ${this.contactId}`,
                            variant: 'success',
                        }),
                    );
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: this.contactId,
                            objectApiName: 'Contact',
                            actionName: 'view'
                        },
                     });
                })
            
            })
           .catch(error => {
               this.dispatchEvent(
                   new ShowToastEvent({
                       title: 'Error creating record',
                       message: error.body.message,
                       variant: 'error',
                   }),
               );
           });
           /*Call fileupload method */
           this.insertUploadedFile();
   }
    /* This method is used to reset user input form variables entered*/
   handleCancel(){
     this.template.querySelectorAll('lightning-input').forEach(field => {
            field.value = null;
        });   
   }

   /* This method is used to create a new Account and related Contact in
    salesforce based on the values entered by the user and reset the values to create new record*/

   handleSaveandNew(){      
    const fields = {};
    fields[nameFld.fieldApiName] = this.accountName;
    fields[accWebsite.fieldApiName] = this.website;
    const accRecordInput = { apiName: accObj.objectApiName, fields};
   
    createRecord(accRecordInput)
        .then(account => {
            this.accountId = account.id;
           
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account created Successfully',
                    variant: 'success',
                }),
            );
             const fields_Contact = {};               
             fields_Contact[accFld.fieldApiName] = this.accountId;   
             fields_Contact[conEmail.fieldApiName] = this.emailId;
             fields_Contact[conFirstName.fieldApiName] = this.firstName;
             fields_Contact[conLastName.fieldApiName] = this.lastName;
             fields_Contact[conPhone.fieldApiName] = this.phone;
             const recordInput_Contact = { apiName: conObj.objectApiName,
                 fields : fields_Contact};

             createRecord(recordInput_Contact)
             .then(contact => {
                 this.contactId = contact.id;

                 this.dispatchEvent(
                     new ShowToastEvent({
                         title: 'Success',
                         message: 'Contact created Successfully',
                         variant: 'success',
                     }),
                 );
                
             })
         
         })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        });

        /*Call fileupload method */
        this.insertUploadedFile();
     
        this.template.querySelectorAll('lightning-input').forEach(field => {
            field.value = null;
        }); 
   }

     /* This method is used to upload a file from system*/
  openfileUpload(event) {
        const file = event.target.files[0]
        var  reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }

        }
        reader.readAsDataURL(file)
   }
        /* This method is used to insert the uploaded file into salesforce*/
    insertUploadedFile(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({ base64, filename, recordId }).then(result=>{
            this.fileData = null
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Efile uploaded',
                    message: error.body.message,
                    variant: 'sucess',
                }),
            );

        })

    }

}