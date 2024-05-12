import React, { useState } from "react";
import styles from "./Search.module.css"; // Import the styles

export default function Search({ setLocation }) {
  const [city, setCity] = useState("");

  const handlesubmit = (e) => {
    e.preventDefault();
    setLocation(city);
  };

  return (
    <>
      <div className={styles.main}>
        <nav className={styles.istclass}>
          <form className={styles.form} onSubmit={handlesubmit}>
            <div className={styles.search}>
              <input
                value={city}
                placeholder="Search your location"
                className={styles.searchbox}
                onChange={(e) => setCity(e.target.value)}
              />

              <button className={styles.nd} type="button" onClick={handlesubmit}>
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </nav>
      </div>
    </>
  );
}
