import { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markAsReadAction } from "../../../redux/actions/emailActions";
import styles from "./styles/EmailView.module.css";
import EmailOptions, {
  Delete,
  GoBack,
  MarkUnread,
  PlaceTrash,
} from "../EmailOptions/EmailOptions";
import { Avatar } from "@material-ui/core";

export default function EmailView({ inbox, sent, drafts, starred, trash }) {
  const dispatch = useDispatch();
  const { category, id } = useParams();

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

  // this side effect marks the email as read (if it wasn't already marked as read)
  // console.log("--------",emailToDisplay);
  useEffect(() => {
    if (!emailToDisplay?.read) dispatch(markAsReadAction(parseInt(id)));
  }, [dispatch, emailToDisplay, parseInt(id)]);

  return (
    <Fragment>
      <EmailOptions >
        <GoBack />
        <PlaceTrash id={parseInt(id)} isInTrash={category === "trash"} />
        {category === "trash" ? <Delete /> : <MarkUnread id={parseInt(id)} />}
      </EmailOptions>
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
                    href={"https://mlbe.onrender.com/pdf/"+attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: '10px' }}
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </Fragment>
  );
}
