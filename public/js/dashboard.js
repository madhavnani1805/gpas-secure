let interval;

/* ========= CHART ========= */
function loadChart(){

  const attempts = parseInt(localStorage.getItem("attempts") || 0);

  new Chart(document.getElementById("attemptChart"),{
    type:'line',
    data:{
      labels:["Attempt 1","Attempt 2","Attempt 3"],
      datasets:[{
        data:[
          attempts >=1 ? 1 : 0,
          attempts >=2 ? 2 : 0,
          attempts >=3 ? 3 : 0
        ],
        borderColor:"#22d3ee",
        backgroundColor:"rgba(34,211,238,0.2)",
        fill:true,
        tension:0.4
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:"#aaa"}},
        y:{ticks:{color:"#aaa"}}
      }
    }
  });
}

window.onload = async function(){

  const username = localStorage.getItem("username");
  const loginTime = localStorage.getItem("loginTime");

  if(!username){
    location.href="login.html";
    return;
  }

  if(!loginTime){
    logout();
    return;
  }

  document.getElementById("userDisplay").innerText = username;
  document.getElementById("userEmail").innerText = username + "@gmail.com";

  // Check admin access via backend
  const res = await fetch(`/all-users?username=${username}`);
  if(res.status !== 403){
    document.getElementById("adminButton").classList.remove("hidden");
  }

  let time = new Date(parseInt(loginTime));

  document.getElementById("sessionInfo").innerText =
    "Session: " + time.toLocaleTimeString();

  document.getElementById("lastLogin").innerText =
    "Last Login: " + time.toLocaleString();

  let attempts = parseInt(localStorage.getItem("lastAttempts") || localStorage.getItem("attempts") || 0);

  document.getElementById("attemptInfo").innerText =
    "Attempts: " + attempts;

  /* SECURITY SCORE */
  let score = 100 - (attempts * 10);
  if(score < 50) score = 50;

  document.getElementById("score").innerText = score + "%";
  document.getElementById("score").style.color = score < 80 ? "red" : "#facc15";

  /* WARNING SYSTEM */
  const alertBox = document.getElementById("alertBox");
  if(attempts >= 2){
    alertBox.innerHTML = "⚠️ Suspicious Activity Detected";
    alertBox.classList.remove("hidden");
  }else{
    alertBox.classList.add("hidden");
  }

  /* ATTEMPTS COLOR */
  if(attempts > 0){
    document.getElementById("attemptInfo").style.color = "orange";
  }

  /* TIMELINE */
  const timeline = document.getElementById("timeline");
  let timelineHTML = "";

  if(attempts > 0){
    timelineHTML += `<li>⚠️ ${attempts} Failed Attempts Detected</li>`;
  }

  timelineHTML += `
    <li>✔ Login Success</li>
    <li>✔ Session Started</li>
    <li>✔ Secure Access Granted</li>
  `;

  timeline.innerHTML = timelineHTML;

  /* LOAD IMAGE */
  try{
    let res = await fetch(`/user/${username}`);
    let data = await res.json();

    if(data.success){
      let img = document.getElementById("profileImage");
      img.src = "/" + data.image_path;
      img.classList.remove("hidden");
    }
  }catch(e){}

  /* 🔥 CALL EVERYTHING */
  loadChart();
  loadFiles();
  updateStorage();

  startTimer(loginTime);
};


/* TIMER */
function startTimer(loginTime){

  let total = 5 * 60 * 1000;

  interval = setInterval(()=>{

    let remain = total - (Date.now() - parseInt(loginTime));

    if(remain <= 0){
      logout();
    }

    let m = Math.floor(remain/60000);
    let s = Math.floor((remain%60000)/1000);

    document.getElementById("timer").innerText =
      `${m}:${s<10?"0"+s:s}`;

  },1000);
}


/* LOGOUT */
function logout(){
  clearInterval(interval);
  localStorage.clear();
  alert("Session Ended");
  location.href="login.html";
}

/* ========= DRAG & DROP ========= */
window.addEventListener("DOMContentLoaded", ()=>{
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  if(!dropZone || !fileInput) return;

  dropZone.onclick = () => fileInput.click();

  dropZone.addEventListener("dragover", e=>{
    e.preventDefault();
    dropZone.classList.add("bg-white/10");
  });

  dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("bg-white/10");
  });

  dropZone.addEventListener("drop", e=>{
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    uploadFile();
  });

  fileInput.addEventListener("change", uploadFile);
});

/* ========= FILE UPLOAD ========= */
async function uploadFile(){

  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const username = localStorage.getItem("username");

  if(!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("username", username);

  const xhr = new XMLHttpRequest();

  xhr.upload.onprogress = e=>{
    const percent = (e.loaded / e.total) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
  };

  xhr.onload = ()=>{
    console.log("UPLOAD RESPONSE:", xhr.status, xhr.responseText);
    loadFiles();
    updateStorage();
  };

  xhr.open("POST","/upload-file");
  xhr.send(formData);
}


/* LOAD FILES */
async function loadFiles(){

  const username = localStorage.getItem("username");

  const res = await fetch(`/get-files?username=${username}`);
  const data = await res.json();

  const list = document.getElementById("fileList");
  list.innerHTML = "";

  data.files.forEach(f=>{
  const safePath = f.replace(/\\/g, "/");
 const fileUrl = "/uploads/" + safePath.split("/").pop();
    const name = safePath.split("/").pop();
    const lower = name.toLowerCase();

    let icon = "📄"; // default
    if(lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".avif") || lower.endsWith(".webp")) icon = "🖼️";
    else if(lower.endsWith(".pdf")) icon = "📕";
    else if(lower.endsWith(".docx") || lower.endsWith(".doc")) icon = "📄";
    else if(lower.endsWith(".zip") || lower.endsWith(".rar")) icon = "📦";

    const previewable = lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".avif") || lower.endsWith(".webp") || lower.endsWith(".pdf");

    list.innerHTML += `
      <div class="flex items-center justify-between bg-white/10 p-3 rounded-xl hover:scale-105 transition">

        <div class="flex items-center gap-2">
          <span>${icon}</span>
          <span class="text-xs">${name}</span>
        </div>

        <div class="flex gap-2">
          ${previewable ? `<button onclick="previewFile('${fileUrl}')" class="bg-blue-500 px-2 py-1 text-xs rounded hover:scale-110">👁️</button>` : `<button disabled class="bg-slate-500/60 px-2 py-1 text-xs rounded cursor-not-allowed">👁️</button>`}

          <a href="${fileUrl}" download
            class="bg-green-500 px-2 py-1 text-xs rounded hover:scale-110">⬇️</a>

          <button onclick="deleteFile('${fileUrl}')"
            class="bg-red-500 px-2 py-1 text-xs rounded hover:scale-110">🗑️</button>

        </div>

      </div>
    `;
  });
}

/* PREVIEW SYSTEM */
function previewFile(path){

  const modal = document.getElementById("previewModal");
  const img = document.getElementById("previewImg");
  const pdf = document.getElementById("previewPdf");

  const fileUrl = path.startsWith("/") ? path : "/" + path;
  const lower = fileUrl.toLowerCase();

  modal.classList.remove("hidden");

  if(lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".avif") || lower.endsWith(".webp")){
    img.src = fileUrl + "?t=" + Date.now();
    img.classList.remove("hidden");
    pdf.classList.add("hidden");
  }else if(lower.endsWith(".pdf")){
   pdf.data = fileUrl + "?t=" + Date.now();
    pdf.classList.remove("hidden");
    img.classList.add("hidden");
  }else{
    alert("Preview not supported for this file type. Please download the file instead.");
    modal.classList.add("hidden");
  }
}

function closePreview(){
  const modal = document.getElementById("previewModal");
  const img = document.getElementById("previewImg");
  const pdf = document.getElementById("previewPdf");

  img.src = "";
  pdf.data = "";
  img.classList.add("hidden");
  pdf.classList.add("hidden");
  modal.classList.add("hidden");
}

/* STORAGE METER */
async function updateStorage(){

  const username = localStorage.getItem("username");

  const res = await fetch(`/get-files?username=${username}`);
  const data = await res.json();

  let size = data.files.length * 2; // fake calc (for demo)

  document.getElementById("storage").innerText =
    size + "%";
}

/* DELETE FILE */
async function deleteFile(path){

  if(!confirm("Delete this file?")) return;

  try{
    const res = await fetch("/delete-file",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({path})
    });

    const data = await res.json();

    if(!data.success){
      alert("Delete failed: " + (data.error || "Unknown error"));
      return;
    }

    loadFiles();
    updateStorage();
  }catch(err){
    alert("Delete failed: " + err.message);
  }
}