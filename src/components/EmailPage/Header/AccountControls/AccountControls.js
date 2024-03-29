import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction, getUserAction } from "../../../../redux/actions/accountActions";
import styles from "./styles/AccountControls.module.css";
import { Avatar, Badge, Button } from "@material-ui/core";

export default function AccountControls({
  user,
  toggleShowEditImage,
  toggleShowProfile,
}) {
  const dispatch = useDispatch();
  const history = useHistory();
  const onClose = () => {
    toggleShowProfile();
  };

  return (
    <div className={styles.container}>
      <Badge
        badgeContent="edit"
        color="secondary"
        overlap="circle"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        style={{ cursor: "pointer" }}
        onClick={() => {
          toggleShowEditImage();
          toggleShowProfile();
        }}
      >
        <Avatar className={styles.avatar} src={user.profilePicture} />
      </Badge>

      <p>
        {" "}
        {user.name}
        {/* {user.name.first} {user.name.last} */}
        <br />
        {user.email}
        {/* {user.email} */}
      </p>

      {/* <Button onClick={() => history.push('/twitter')}>Visit my twitter page</Button> */}
      <Button onClick={() => dispatch(logoutAction())}>Logout</Button>
      <br />
      <span onClick={onClose}>&times;</span>
    </div>
  );
}
