

let selectedRole = "customer";

let isRegisterMode = false;

/* Role Toggle */

function setRole(role,element){

  selectedRole = role;

  document
  .querySelectorAll(".role-btn")
  .forEach(btn=>{

    btn.classList.remove("active");

  });

  element.classList.add("active");

  /* Disable admin registration */

  if(role === "admin"){

    isRegisterMode = false;

    updateAuthMode();

    document
    .getElementById("toggleAuth")
    .style.display = "none";

    document
    .getElementById("authText")
    .innerText =
    "Admin accounts are managed securely.";

  }

  else{

    document
    .getElementById("toggleAuth")
    .style.display = "inline";

    updateFooterText();
  }

}

/* Toggle Login/Register */

document
.getElementById("toggleAuth")

.addEventListener("click",(e)=>{

  e.preventDefault();

  isRegisterMode = !isRegisterMode;

  updateAuthMode();

});

/* Update UI */

function updateAuthMode(){

  const registerFields =
  document.querySelectorAll(".register-only");

  registerFields.forEach(field=>{

    field.style.display =
    isRegisterMode ? "block" : "none";

  });

  const submitBtn =
  document.getElementById("submitBtn");

  submitBtn.innerText =
  isRegisterMode
  ? "Create Customer Account"
  : "Secure Login";

  updateFooterText();
}

/* Footer Text */

function updateFooterText(){

  if(selectedRole !== "customer") return;

  document.getElementById("authText")
  .innerText = isRegisterMode
  ? "Already have an account?"
  : "Don't have a customer account?";

  document.getElementById("toggleAuth")
  .innerText = isRegisterMode
  ? "Login"
  : "Create Account";
}

/* Submit */

document
.getElementById("authForm")

.addEventListener(
"submit",

async(e)=>{

  e.preventDefault();

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  /* REGISTER */

  if(isRegisterMode){

    const full_name =
    document
    .getElementById("full_name")
    .value;

    const confirmPassword =
    document
    .getElementById("confirmPassword")
    .value;

    if(password !== confirmPassword){

      alert(
        "Passwords do not match"
      );

      return;
    }

    try{

      const response =
      await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            full_name,
            email,
            password,
            role:"customer"

          })
        }
      );

      const data =
      await response.json();

      if(!response.ok){

        alert(data.message);

        return;
      }

      alert(
        "Account Created Successfully"
      );

      isRegisterMode = false;

      updateAuthMode();

    }

    catch(error){

      console.log(error);

      alert(
        "Server Error"
      );
    }

    return;
  }

  /* LOGIN */

  try{

    const response =
    await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          email,
          password
        })
      }
    );

    const data =
    await response.json();

    if(!response.ok){

      alert(data.message);

      return;
    }

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "role",
      data.role
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    /* Redirect */

    if(data.role === "admin"){

      window.location.href =
      "admin.html";
    }

    else{

      window.location.href =
      "customer.html";
    }

  }

  catch(error){

    console.log(error);

    alert(
      "Server Error"
    );
  }

});

