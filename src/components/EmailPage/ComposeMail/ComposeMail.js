import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendEmailAction,
  saveDraftAction,
  updateDraftAction,
} from "../../../redux/actions/emailActions";
import { useForm } from "react-hook-form";
import { Button } from "@material-ui/core";
import styles from "./styles/ComposeMail.module.css";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

function ComposeMail({ toggleIsCompose, composeDraft }) {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();
  const [ccEmails, setCCEmails] = useState(composeDraft?.cc || []);
  const [bccEmails, setBCCEmails] = useState(composeDraft?.bcc || []);
  const registeredEmail = useSelector((state) => state.userReducer.user.email);
  const { register, handleSubmit, errors, watch } = useForm({
    defaultValues: {
      from: registeredEmail,
      to: composeDraft?.to || "",
      cc: [],
      bcc: [],
      subject: composeDraft?.subject || "",
      message: composeDraft?.message || "",
      // attachment: composeDraft?.attachment || [],
    },
  });

  const onSubmit = async (values) => {
    values.attachment = Array.from(values.attachment || []);
    // const formData = new FormData();
    // formData.append('to', values.to);
    // formData.append('cc', JSON.stringify(values.cc));
    // formData.append('bcc', JSON.stringify(values.bcc));
    // formData.append('subject', values.subject);
    // formData.append('message', values.message);

    // // Append files to the formData
    // for (const file of values.attachment) {
    //   formData.append('attachment', file);
    // }
    values.cc = JSON.stringify(values.cc)
    values.bcc = JSON.stringify(values.bcc)
    console.log("values: " + values.cc);
    if (!composeDraft) {
      try {
        setIsSending(true);
        await dispatch(sendEmailAction(values));
        toast.success("Email sent successfully!", {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: true, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } catch (error) {
        console.error("Error sending email:", error);
        toast.error("Failed to send email!", {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: true, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } finally {
        setIsSending(false); // Hide spinner after sending ends
      }
    } else {
      // but if the component was called by clicking on a draft,
      // then the email is sent, and the draft is updated too!
      try {
        setIsSending(true);

        await dispatch(sendEmailAction(values));
        toast.success("Email sent successfully!", {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: false, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } catch (error) {
        console.error("Error sending email:", error);
        toast.error("Failed to send email!", {
          position: "top-left", // Adjust position as needed
          autoClose: 10000, // Close toast after 5 seconds
          hideProgressBar: false, // Hide progress bar
          closeOnClick: true, // Close toast on click
          duration: 5000, //
        });
      } finally {
        setIsSending(false); // Hide spinner after sending ends
      }
      let form = {
        from: watch("from"),
        to: watch("to"),
        cc: watch("cc"),
        bcc: watch("bcc"),
        subject: watch("subject"),
        message: watch("message"),
        attachment: Array.from(watch("attachment") || []),
      };
      dispatch(updateDraftAction(composeDraft.id, form));
    }
    toggleIsCompose();
  };

  const onClose = () => {
    let form = {
      from: watch("from"),
      to: watch("to"),
      cc: watch("cc"),
      bcc: watch("bcc"),
      subject: watch("subject"),
      message: watch("message"),
      attachment: Array.from(watch("attachment") || []),
    };
    if (!composeDraft) {
      // the following is used to save a message as draft
      // (only if one of the fields are not empty)
      if (form.to !== "" || form.subject !== "" || form.message !== "") {
        dispatch(saveDraftAction(form));
      }
    } else {
      // the following is used to update the existing draft
      dispatch(updateDraftAction(composeDraft.id, form));
    }
    toggleIsCompose();
  };
  return isSending ? (
    <ClipLoader
      type="ClipLoader"
      size={150}
      color="#0000ff"
      height={100}
      width={100}
    />
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.compose}>
      <div className={styles.header}>
        <h5>New Message</h5>
        <span onClick={onClose}>&times;</span>
      </div>
      <div className={styles.inpGroup}>
        <label htmlFor="from">From:</label>
        <input
          name="from"
          id="from"
          type="email"
          ref={register({
            required: false,
            // eslint-disable-next-line no-useless-escape
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
          readOnly
        />
      </div>
      <Toaster />
      <div className={styles.inpGroup}>
        <label htmlFor="to">To:</label>
        <input
          name="to"
          id="to"
          type="email"
          ref={register({
            required: true,
            // eslint-disable-next-line no-useless-escape
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
        />
      </div>
      <div className={styles.inpGroup}>
        <label htmlFor="cc">CC:</label>
        {ccEmails.map((email, index) => (
          <div key={index} className={styles.ccBccRow}>
            <input
              name={`cc[${index}]`}
              id={`cc-${index}`}
              type="email"
              defaultValue={email}
              ref={register({
                // eslint-disable-next-line no-useless-escape
                pattern:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              })}
            /> <br />
            <button
              type="button"
              onClick={() => {
                const updatedCCEmails = [...ccEmails];
                updatedCCEmails.splice(index, 1);
                setCCEmails(updatedCCEmails);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button type="button" onClick={() => setCCEmails([...ccEmails, ""])}>
          Add CC
        </button>
      </div>
      <div className={styles.inpGroup}>
        <label htmlFor="bcc">BCC:</label>
        {bccEmails.map((email, index) => (
          <div key={index} className={styles.ccBccRow}>
            <input
              name={`bcc[${index}]`}
              id={`bcc-${index}`}
              type="email"
              defaultValue={email}
              ref={register({
                // eslint-disable-next-line no-useless-escape
                pattern:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              })}
            />
            <button
              type="button"
              onClick={() => {
                const updatedBCCEmails = [...bccEmails];
                updatedBCCEmails.splice(index, 1);
                setBCCEmails(updatedBCCEmails);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setBCCEmails([...bccEmails, ""])}>
          Add BCC
        </button>
      </div>
      <div className={styles.inpGroup}>
        <label htmlFor="subject">Subject:</label>
        <input
          name="subject"
          id="subject"
          type="text"
          ref={register({
            required: true,
          })}
        />
      </div>
      <textarea
        name="message"
        ref={register({
          required: true,
        })}
      />
      <div className={styles.inpGroup}>
        <label htmlFor="attachment">Attachment:</label>
        <input
          name="attachment"
          id="attachment"
          type="file"
          ref={register}
          multiple
        />
      </div>
      <div className={styles.send}>
        <Button type="submit">Send</Button>
        <br /> <br />
        <span>
          <p>{errors.to?.type === "required" && "Recipient is required"}</p>
          <p>{errors.to?.type === "pattern" && "Invalid email"}</p>
          <p>{errors.subject?.type === "required" && "Subject is required"}</p>
          <p>
            {errors.message?.type === "required" && "Email message is required"}
          </p>
        </span>
      </div>
      <br /> <br />
    </form>
  );
}

export default ComposeMail;
