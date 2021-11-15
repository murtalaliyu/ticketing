// This function can only by called/used inside of a react component. We cannot use this in getInitialProps

import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);  // reset errors state
      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;

    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <ul className="my-0">
            {
              err.response.data.errors.map(err => (
                <li key={err.message}>{err.message}</li>
              ))
            }
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
