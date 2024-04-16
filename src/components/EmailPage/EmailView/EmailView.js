import { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markAsReadAction } from "../../../redux/actions/emailActions";
import styles from "./styles/EmailView.module.css";
import EmailOptions, {
  Delete,
  GoBack,
  MarkUnread,
  PlaceTrash,
} from "../EmailOptions/EmailOptions";
import { Avatar } from "@material-ui/core";
import { sendEmailAction } from "../../../redux/actions/emailActions";
import { useForm } from "react-hook-form";
import { Button } from "@material-ui/core";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function EmailView({ inbox, sent, drafts, starred, trash }) {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();
  const { category, id } = useParams();
  const registeredEmail = useSelector((state) => state.userReducer.user.email);
  console.log(category, id);
  const [emailToDisplay] = useState(() => {
    switch (category) {
      case "inbox":
        const inboxItem = inbox.find((item) => item.id === parseInt(id));

        return inboxItem;
      case "sent":
        const sentItem = sent.find((item) => item.id === parseInt(id));
        console.log("sent item ID:", sentItem?.id);
        return sentItem;
      case "drafts":
        const draftsItem = drafts.find((item) => item.id === parseInt(id));
        console.log("drafts item ID:", draftsItem?.id);
        return draftsItem;
      case "starred":
        const starredItem = starred.find((item) => item.id === parseInt(id));
        console.log("starred item ID:", starredItem?.id);
        return starredItem;
      case "trash":
        const trashItem = trash.find((item) => item.id === parseInt(id));
        console.log("trash item ID:", trashItem?.id);
        return trashItem;
      default:
        break;
    }
  });

  const [forwardTo, setForwardTo] = useState("");

  useEffect(() => {
    if (!emailToDisplay?.read) dispatch(markAsReadAction(parseInt(id)));
  }, [dispatch, emailToDisplay, parseInt(id)]);

  const emailFrom = emailToDisplay.from;
  const regex = /<(.*?)>/;
  const match = regex.exec(emailFrom);

  const extractedValue = match ? match[1] : emailFrom;
  emailToDisplay.from = extractedValue;
  // console.log("valll", (emailToDisplay.from))
  const handleForward = () => {
    // Prepare data for pre-filling the ComposeMail form
    // console.log(
    //   "subject",
    //   emailToDisplay.attachment,
    //   "message",
    //   emailToDisplay.message,
    //   forwardTo
    // );
    
    const forwardData = {
      from: registeredEmail,
      to: forwardTo, // Optional: Allow user to specify a new recipient
      subject: `Fwd: ${emailToDisplay.subject}`, // Prepend "Fwd:" to subject
      attachment: emailToDisplay.attachment, // Optional: Allow user to specify an attachment
      message: emailToDisplay.message,
    };
    // dispatch(sendEmailAction(forwardData));
    try {
      setIsSending(true);
      dispatch(sendEmailAction(forwardData));
      setForwardTo("");
      toast.success("Email forwarded successfully!", {
        position: "top-left", // Adjust position as needed
        autoClose: 50000, // Close toast after 5 seconds
        hideProgressBar: false, // Hide progress bar
        closeOnClick: true, // Close toast on click
        duration: 5000, //
      });
    } catch (error) {
      console.error("Error forwarding email:", error);
      setForwardTo("");
      toast.error("Failed to forward email!", {
        position: "top-left", // Adjust position as needed
        autoClose: 50000, // Close toast after 5 seconds
        hideProgressBar: false, // Hide progress bar
        closeOnClick: true, // Close toast on click
        duration: 5000, //
      }); // Use toast.error() for error notifications
    } finally {
      setIsSending(false); // Hide spinner after sending ends
    }
  };
  const { register, handleSubmit, errors, watch } = useForm({
    defaultValues: {
      from: registeredEmail,
      to: emailToDisplay.from,
      subject: `Replied: ${emailToDisplay.subject}`,
      message: "",
      // attachment: composeDraft?.attachment || [],
    },
  });
  const onSubmit = async (values) => {
    values.attachment = Array.from(values.attachment || []);
    console.log("valoly:", values)
    try {
      setIsSending(true);
      await dispatch(sendEmailAction(values));
      toast.success("Email replied successfully!", {
        position: "top-left", // Adjust position as needed
        autoClose: 50000, // Close toast after 5 seconds
        hideProgressBar: false, // Hide progress bar
        closeOnClick: true, // Close toast on click
        duration: 5000, //
      });
    } catch (error) {
      console.error("Error replyinging email:", error);
      toast.error("Failed to reply email!", {
        position: "top-left", // Adjust position as needed
        autoClose: 50000, // Close toast after 5 seconds
        hideProgressBar: false, // Hide progress bar
        closeOnClick: true, // Close toast on click
        duration: 5000, //
      }); // Use toast.error() for error notifications
    } finally {
      setIsSending(false); // Hide spinner after sending ends
    }
    // let form = {
    //   from: watch('from'),
    //   to: watch('to'),
    //   subject: watch('subject'),
    //   message: watch('message'),
    //   attachment: Array.from(watch('attachment') || []),
    // };
  };

  return (
    <Fragment>
      <EmailOptions>
        <GoBack />
        <PlaceTrash id={parseInt(id)} isInTrash={category === "trash"} />
        {category === "trash" ? (
          <Delete />
        ) : (
          <>
            <MarkUnread id={parseInt(id)} />
           
            <div
              className={`${styles.forward} ${styles.forwardInput} ${styles.forwardButton}`}
            >
              <input
                type="email"
                placeholder="Enter recipient email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
              />
              <button onClick={handleForward}>Forward</button>
            </div>
            
          </>
        )}
      </EmailOptions>
      <Toaster />
      {isSending && (
        <ClipLoader
          type="ClipLoader"
          size={150}
          color="#0000ff"
          height={100}
          width={100}
        />
      )}
      {emailToDisplay ? (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <h3>{emailToDisplay.subject}</h3>
            <div>
              <Avatar className={styles.avatar} />
              {emailToDisplay.from}
              <br />
              to me
            </div>
            <p dangerouslySetInnerHTML={{ __html: emailToDisplay.message }}></p>

            {emailToDisplay?.attachments?.length > 0 && (
              <div className={styles.attachments}>
                <h4>Attachments:</h4>
                {emailToDisplay.attachments.map((attachmentUrl, index) => (
                  <a
                    key={index}
                    href={"https://mlbe.onrender.com/pdf/" + attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px" }}
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            )}
            <br />
            <div className={styles.formCont}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                // className={styles.reply}
              >
                <div className={styles.replyHeader}>
                  <h5>Reply Message</h5>
                </div>
                <div className={styles.inpGroup}>
                  <label htmlFor="from">From:</label>
                  <input
                    className={styles.inputRe}
                    value={(emailToDisplay.to).value}
                    name="from"
                    id="from"
                    placeholder={(emailToDisplay.to).value}
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
                <div className={styles.inpGroup}>
                  <label htmlFor="to">To:</label>
                  <input
                    className={styles.inputRe}
                    value={(emailToDisplay.from).value}
                    name="to"
                    placeholder={(emailToDisplay.from).value}
                    id="to"
                    type="email"
                    ref={register({
                      required: true,
                      // eslint-disable-next-line no-useless-escape
                      pattern:
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    })}
                    readOnly
                  />
                </div>
                <div className={styles.inpGroup}>
                  <label htmlFor="subject">Subject:</label>
                  <input
                    className={styles.inputRe}
                    name="subject"
                    value={emailToDisplay.subject}
                    placeholder={emailToDisplay.subject}
                    id="subject"
                    type="text"
                    ref={register({
                      required: true,
                    })}
                    readOnly
                  />
                </div>
                <textarea
                  placeholder="type your reply here..."
                  className={styles.inputReBig}
                  name="message"
                  ref={register({
                    required: true,
                  })}
                />
                <div className={styles.inpGroup}>
                  <label htmlFor="attachment">Attachment:</label>
                  <input
                    className={styles.inputRe}
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
                  <p>
                    {errors.to?.type === "required" && "Recipient is required"}
                  </p>
                  <p>{errors.to?.type === "pattern" && "Invalid email"}</p>
                  <p>
                    {errors.subject?.type === "required" &&
                      "Subject is required"}
                  </p>
                  <p>
                    {errors.message?.type === "required" &&
                      "Email message is required"}
                  </p>
                </span>
                </div>
                <br /> <br />
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </Fragment>
  );
}
