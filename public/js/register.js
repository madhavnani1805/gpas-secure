const upload = document.getElementById("imageUpload");
const img = document.getElementById("preview");
const form = document.getElementById("registerForm");
const imgBox = document.getElementById("imgBox");

let points = [];

/* ===== OTP VARIABLES ===== */
let generatedOTP = null;
let otpVerified = false;

/* ========= Toast ========= */
function showToast(msg, color="bg-green-500"){
  let t=document.createElement("div");
  t.className=`${color} fixed bottom-6 right-6 text-white px-4 py-2 rounded shadow`;
  t.innerText=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

/* ========= OTP ========= */
function sendOTP(){

  const email = document.getElementById("email").value.trim();

  if(email === ""){
    showToast("Enter email first ❌","bg-red-500");
    return;
  }

  const gmailRegex=/^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if(!gmailRegex.test(email)){
    showToast("Only Gmail allowed ❌","bg-red-500");
    return;
  }

  generatedOTP = Math.floor(100000 + Math.random() * 900000);

  alert("OTP sent to email: " + generatedOTP);

  showToast("OTP generated ✔");

}

/* ========= Upload ========= */
upload.onchange=function(e){

  const file=e.target.files[0];
  if(!file) return;

  if(file.size>300*1024){
    showToast("Image must be < 300KB ❌","bg-red-500");
    upload.value="";
    return;
  }

  img.src=URL.createObjectURL(file);
  img.classList.remove("hidden");

  clearPoints();
};


/* ========= CLEAR ========= */
function clearPoints(){
  points=[];
  imgBox.querySelectorAll(".dot").forEach(d=>d.remove());
}


/* ========= REMOVE LAST ========= */
function undoPoint(){
  if(points.length===0) return;

  points.pop();
  imgBox.lastChild.remove();
  showToast("Last point removed","bg-yellow-500");
}


/* ========= Click Points ========= */
img.addEventListener("click",function(e){

  if(points.length>=4) return;

  const rect=img.getBoundingClientRect();

  const xPercent=((e.clientX-rect.left)/rect.width)*100;
  const yPercent=((e.clientY-rect.top)/rect.height)*100;

  points.push({x:xPercent,y:yPercent});

  let dot=document.createElement("div");
  dot.className="dot";

  dot.style.position="absolute";
  dot.style.left=xPercent+"%";
  dot.style.top=yPercent+"%";
  dot.style.width="12px";
  dot.style.height="12px";
  dot.style.background="red";
  dot.style.borderRadius="50%";
  dot.style.transform="translate(-50%,-50%)";

  imgBox.appendChild(dot);

  showToast(`Point ${points.length}/4`);
});



/* ========= Submit (BACKEND CONNECTED) ========= */
form.addEventListener("submit", async function(e){

  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim();
  const file     = upload.files[0];

  /* ===== USERNAME CHECK ===== */
  if(username===""){
    showToast("Enter username ❌","bg-red-500");
    return;
  }

  /* ===== EMAIL CHECK ===== */
  const gmailRegex=/^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if(!gmailRegex.test(email)){
    showToast("Only Gmail allowed ❌","bg-red-500");
    return;
  }

  /* ========= OTP CHECK (THIS IS THE CORRECT PLACE) ========= */
  const enteredOTP = document.getElementById("otp").value.trim();

  if(generatedOTP === null){
    showToast("Generate OTP first ❌","bg-red-500");
    return;
  }

  if(enteredOTP != generatedOTP){
    showToast("Wrong OTP ❌","bg-red-500");
    return;
  }

  /* ===== CLICK POINTS CHECK ===== */
  if(points.length!==4){
    showToast("Select 4 points ❌","bg-red-500");
    return;
  }

  /* ===== IMAGE CHECK ===== */
  if(!file){
    showToast("Upload image ❌","bg-red-500");
    return;
  }

  /* ⭐ SEND TO BACKEND */
  const formData=new FormData();
  formData.append("username",username);
  formData.append("email",email);
  formData.append("points",JSON.stringify(points));
  formData.append("image",file);

  const res=await fetch("/register",{
    method:"POST",
    body:formData
  });

  const data=await res.json();

  if(data.success){
    showToast("Account created 🎉");
    setTimeout(()=>location.href="login.html",1000);
  }else{
    showToast("Registration failed ❌","bg-red-500");
  }

});