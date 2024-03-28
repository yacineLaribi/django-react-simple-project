import React , { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Swal from 'sweetalert2'


const ItemList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(0);

  useEffect(() => {
      // Define a function to fetch items from the backend
      const fetchItems = async () => {
          try {
              const response = await fetch(`/api/items`);
              if (!response.ok) {
                  throw new Error('Failed to fetch items');
              }
              const data = await response.json();
              setItems(data.items);
              setCategories(data.categories);
              setCategoryId(data.category_id);
          } catch (error) {
              console.error(error);
          }
      };

      // Call the fetchItems function
      fetchItems();
  }, [categoryId]); // This useEffect will re-run whenever query or categoryId changes

  // Render the item list
  return (
    <div>
      <h2>Item List</h2>
      <ul>
        {/* Loop through the items array and generate JSX for each item */}
        {items.map(item => (
          <li key={item.id}>Name :{item.name}
          <br />
          Price: {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

//instantiating Cookies class by creating cookies object
const cookies = new Cookies();

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      error: "",
      isAuthenticated: false,
    };
  }
  

  handleRegistration = (event) => {
    event.preventDefault();
    if (this.state.password !== this.state.confirmPassword) {
        Swal.fire({
          title: "Ooops!",
          text: "Passwords do not match!",
          icon: "error",
        });
        this.setState({error: "Passwords do not match"});
        return;
    }
    fetch("/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": cookies.get("csrftoken"),
        },
        credentials: "same-origin",
        body: JSON.stringify({
            username: this.state.username,
            password: this.state.password,
            confirm_password: this.state.confirmPassword,
            email: this.state.email,
            full_name: this.state.fullName
        }),
    })
    .then(this.isResponseOk)
    .then((data) => {
        console.log(data);
        Swal.fire({
          title: "Succefully Signed in !",
          text: "Go to dashboard!",
          icon: "success"
        });
        this.setState({isAuthenticated: true, username: "", password: "", confirmPassword: "", fullName: "", email: "", error: ""});
    })
    .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "Error !",
          text: "Username already exists or other error occurred.",
          icon: "error"
        });
        this.setState({error: "Username already exists or other error occurred."});
    });
}

    handleFullNameChange = (event) => {
        this.setState({fullName: event.target.value});
    }

    handleEmailChange = (event) => {
        this.setState({email: event.target.value});
    }

    handleConfirmPasswordChange = (event) => {
        this.setState({confirmPassword: event.target.value});
    }

    componentDidMount = () => {
      this.getSession();
    }

// Get Session Method
  getSession = () => {
    //? Make a GET request to the "/api/session/" URL with "same-origin" credentials
    fetch("/api/session/", {
      credentials: "same-origin",
    })
    .then((res) => res.json()) //! Parse the response as JSON
    .then((data) => {
      console.log(data); //! Log the response data to the console
      //? If the response indicates the user is authenticated
      if (data.isAuthenticated) {
        this.setState({isAuthenticated: true}); //! Update the component's state
      } else {  //! If the response indicates the user is not authenticated
        this.setState({isAuthenticated: false}); //! Update the component's state
      }
    })
      //? Handle any errors that occurred during the fetch
    .catch((err) => {
      console.log(err);
    });
  }
  
//Who Am I method
  whoami = () => {
    fetch("/api/whoami/", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    })
    .then((res) => res.json())
    .then((data) => {
      Swal.fire("You are logged in as: " + data.username);
      console.log("You are logged in as: " + data.username);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handlePasswordChange = (event) => {
    this.setState({password: event.target.value});
  }

  handleUserNameChange = (event) => {
    this.setState({username: event.target.value});
  }

  isResponseOk(response) {
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  //Login Mthod
  login = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
     // Make a POST request to the "/api/login/" URL with the form data
    fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get("csrftoken"),
      },
      credentials: "same-origin",
      body: JSON.stringify({username: this.state.username, password: this.state.password}),
    })
    .then(this.isResponseOk)
    .then((data) => {
      console.log(data);
      Swal.fire({
        title: "Welcome!",
        text: "Go to Dashboard.",
        icon: "success"
      });
      this.setState({isAuthenticated: true, username: "", password: "", error: ""});
    })
    .catch((err) => {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wrong username or password!",
      });
      this.setState({error: "Wrong username or password."});
    });
  }

  //Logout Method
  logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "We will miss you!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Logged Out!",
          text: "You logged out perfectly from your account.",
          icon: "success"
        });
        fetch("/api/logout", {
          credentials: "same-origin",
        })
        .then(this.isResponseOk)
        .then((data) => {
          console.log(data);
          this.setState({isAuthenticated: false});
        })
        .catch((err) => {
          console.log(err);
        });
      }
    });
  };


  // UI Rendering using bootstrap 
  render() {
    if (!this.state.isAuthenticated) {
      return (
        <div className="container mt-3">
          <h1>React Cookie Auth</h1>
          <br />
          <h2>Login</h2>
          <form onSubmit={this.login}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" className="form-control" id="username" name="username" value={this.state.username} onChange={this.handleUserNameChange} />
            </div>
            <div className="form-group">
              <label htmlFor="username">Password</label>
              <input type="password" className="form-control" id="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
              <div>
                {this.state.error &&
                  <small className="text-danger">
                    {this.state.error}
                  </small>
                }
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          <br />
          <h2>Register</h2>
                <form onSubmit={this.handleRegistration}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" className="form-control" id="username" name="username" value={this.state.username} onChange={this.handleUserNameChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input type="text" className="form-control" id="fullName" name="fullName" value={this.state.fullName} onChange={this.handleFullNameChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" className="form-control" id="email" name="email" value={this.state.email} onChange={this.handleEmailChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} />
                        <div>
                            {this.state.error &&
                                <small className="text-danger">
                                    {this.state.error}
                                </small>
                            }
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
        </div>
      );
    } else {
    return (
      <div className="container mt-3">
        <h1>React Cookie Auth</h1>
        <p>You are logged in!</p>
        <button className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button>
        <button className="btn btn-danger" onClick={this.logout}>Log out</button>
        <br />
        <ItemList /> 
      </div>
      
    )}
  }
}

export default App;