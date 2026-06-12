let generatedOTP = null;

/* ========= SEND OTP ========= */
function sendOTP(){

  const email = document.getElementById("email").value.trim();

  if(email === ""){
    alert("Enter email first ❌");
    return;
  }

  const gmailRegex=/^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if(!gmailRegex.test(email)){
    alert("Only Gmail allowed ❌");
    return;
  }

  generatedOTP = Math.floor(100000 + Math.random() * 900000);

  alert("OTP sent to your email (simulated): " + generatedOTP);

}

/* ========= VERIFY OTP ========= */
function verifyOTP(){

  const entered = document.getElementById("otp").value.trim();
  const email = document.getElementById("email").value.trim();

  if(generatedOTP === null){
    alert("Generate OTP first ❌");
    return;
  }

  if(entered != generatedOTP){
    alert("Wrong OTP ❌");
    return;
  }

  alert("OTP Verified ✔");

  // ⭐ STORE EMAIL
  localStorage.setItem("resetEmail", email);

  // redirect
  window.location.href = "reset.html";
}