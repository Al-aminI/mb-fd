import { useState, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import styles from './styles/AuthPage.module.css';
import FormLogin from './Form/FormLogin';
import FormRegister from './Form/FormRegister';
// import GmailIcon from './images/gmail.svg';

export default function AuthPage() {
  const { user, isLoading, error } = useSelector((state) => state.userReducer);
  console.log(user.email);
  // defines if the register or login form is displayed
  const [isCreateNew, setIsCreateNew] = useState(false);
  const toggleIsCreateNew = () => setIsCreateNew(!isCreateNew);

  // if the user has registered, and the email used has been applied,
  // then toggle state to show 'login' component with the registered email.
  useEffect(() => {
    if (user.email) {
      toggleIsCreateNew();
      alert('Account successfully created!');
    }
    // eslint-disable-next-line
  }, [user.email]);

  return (
    <div className={styles.page}>
      <img src="lg.png" alt='NMFB' />

      {isCreateNew ? (
        <Fragment>
          <FormRegister isLoading={isLoading} error={error} />
          <br />
          <button className={styles.link} onClick={toggleIsCreateNew}>
            Login an existing account
          </button>
        </Fragment>
      ) : (
        <Fragment>
          <FormLogin isLoading={isLoading} error={error} user={user} />
          <br />
          <button className={styles.link} onClick={toggleIsCreateNew}>
            Create a new account
          </button>
        </Fragment>
      )}

      <p>
        this is NMFB , all accounts are stored in a database
      </p>
    </div>
  );
}
