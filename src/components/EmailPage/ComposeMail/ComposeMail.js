import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendEmailAction,
  saveDraftAction,
  updateDraftAction,
} from '../../../redux/actions/emailActions';
import { useForm } from 'react-hook-form';
import { Button } from '@material-ui/core';
import styles from './styles/ComposeMail.module.css';
import  toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';


function ComposeMail({ toggleIsCompose, composeDraft }) {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();
  const registeredEmail = useSelector((state) => state.userReducer.user.email);
  const { register, handleSubmit, errors, watch } = useForm({
    defaultValues: {
      from: registeredEmail,
      to: composeDraft?.to || '',
      subject: composeDraft?.subject || '',
      message: composeDraft?.message || '',
      // attachment: composeDraft?.attachment || [],
    },
  });

  // The following references purposes are to "pull" the form data from the useForm hook,
  // and used whenever the message will be saved as a draft
  // const from = useRef({});
  // const to = useRef({});
  // const subject = useRef({});
  // const message = useRef({});
  // const attachment = useRef([]);
  // attachment = watch('attachment', []);
  // from.current = watch('from', '');
  // to.current = watch('to', '');
  // subject.current = watch('subject', '');
  // message.current = watch('message', '');
 

  // the following function sends the message
  // (the server also creates a random reply to be received by the user)
  const onSubmit = async (values) => {
    values.attachment = Array.from(values.attachment || []);

    if (!composeDraft) {
      
      try {
        setIsSending(true);
        await dispatch(sendEmailAction(values));
        toast.success('Email sent successfully!', {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: true, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('Failed to sending email!', {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: true, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      }
    finally {
      setIsSending(false); // Hide spinner after sending ends
    }
    } else {
      // but if the component was called by clicking on a draft,
      // then the email is sent, and the draft is updated too!
      try {
        setIsSending(true);
        await dispatch(sendEmailAction(values));
        toast.success('Email sent successfully!', {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar:  false, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('Failed to send email!', {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar:  false, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } finally {
        setIsSending(false); // Hide spinner after sending ends
      }
      let form = {
        from: watch('from'),
        to: watch('to'),
        subject: watch('subject'),
        message: watch('message'),
        attachment: Array.from(watch('attachment') || []),
      };
      dispatch(updateDraftAction(composeDraft.id, form));
    }
    toggleIsCompose();
  };

  const onClose = () => {
    let form = {
      from: watch('from'),
      to: watch('to'),
      subject: watch('subject'),
      message: watch('message'),
      attachment: Array.from(watch('attachment') || []),
    };
    if (!composeDraft) {
      // the following is used to save a message as draft
      // (only if one of the fields are not empty)
      if (form.to !== '' || form.subject !== '' || form.message !== '') {
        dispatch(saveDraftAction(form));
        
  
      }
    } else {
      // the following is used to update the existing draft
      dispatch(updateDraftAction(composeDraft.id, form));
  
    }
    toggleIsCompose();
  };
  
 
  return (
    isSending ? (
      <ClipLoader type="ClipLoader" size={150} color="#0000ff" height={100} width={100} />
    ) :
    <form onSubmit={handleSubmit(onSubmit)} className={styles.compose}>
      <div className={styles.header}>
        <h5>New Message</h5>
        <span onClick={onClose}>&times;</span>
      </div>

      <div className={styles.inpGroup}>
        <label htmlFor='from'>From:</label>
        <input
          name='from'
          id='from'
          type='email'
          ref={register({
            required: false,
            // eslint-disable-next-line no-useless-escape
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
          readOnly
        />
      </div>
         <Toaster />
      <div className={styles.inpGroup}>
        <label htmlFor='to'>To:</label>
        <input
          name='to'
          id='to'
          type='email'
          ref={register({
            required: true,
            // eslint-disable-next-line no-useless-escape
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
        />
      </div>

      <div className={styles.inpGroup}>
        <label htmlFor='subject'>Subject:</label>
        <input
          name='subject'
          id='subject'
          type='text'
          ref={register({
            required: true,
          })}
        />
      </div>

      <textarea
        name='message'
        ref={register({
          required: true,
        })}
      />
      <div className={styles.inpGroup}>
        <label htmlFor='attachment'>Attachment:</label>
        <input
          name='attachment'
          id='attachment'
          type='file'
          ref={register}
          multiple
        />
      </div>
      <div className={styles.send}>
        <Button type='submit'>Send</Button>
        <br /> <br />
        <span>
          <p>{errors.to?.type === 'required' && 'Recipient is required'}</p>
          <p>{errors.to?.type === 'pattern' && 'Invalid email'}</p>
          <p>{errors.subject?.type === 'required' && 'Subject is required'}</p>
          <p>{errors.message?.type === 'required' && 'Email message is required'}</p>
        </span>
      </div>
      <br /> <br />
     </form>
     
  );
}

export default ComposeMail;
