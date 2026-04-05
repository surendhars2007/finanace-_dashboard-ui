const users = {
  admin: { pass: "1234", role: "admin" },
  user: { pass: "1234", role: "viewer" }
};

let data=[];
let lineChart, pieChart;

// LOGIN
function login(){
  let u=username.value;
  let p=password.value;

  if(users[u] && users[u].pass===p){
    localStorage.setItem("user",u);
    window.location.href="./dashboard.html";
  } else alert("Wrong login");
}

// LOGOUT
function logout(){
  localStorage.removeItem("user");
  window.location.href="./login.html";
}

// INIT
window.onload=function(){
  if(document.getElementById("lineChart")){
    let user=localStorage.getItem("user");

    if(!user){
      window.location.href="./login.html";
      return;
    }

    if(users[user].role==="admin"){
      adminPanel.classList.remove("hidden");
    }

    generateData();
    render();
  }
};

// DATA
function generateData(){
  const cats=["Food","Shopping","Travel","Bills","Entertainment"];

  for(let i=0;i<300;i++){
    let inc=Math.random()>0.7;

    let d=new Date();
    d.setDate(d.getDate()-Math.floor(Math.random()*60));

    data.push({
      type:inc?'income':'expense',
      amount:Math.floor(Math.random()*5000),
      category:inc?'Salary':cats[Math.floor(Math.random()*cats.length)],
      desc:'Item '+i,
      date:d.toISOString().split('T')[0]
    });
  }
}

// FILTER
function getFiltered(){
  let s=search.value.toLowerCase();
  let f=filter.value;

  return data.filter(d=>{
    return d.desc.toLowerCase().includes(s) &&
      (f==="all"||d.type===f);
  });
}

// RENDER
function render(){
  let inc=0,exp=0,cat={};

  data.forEach(d=>{
    if(d.type==="income") inc+=d.amount;
    else{
      exp+=d.amount;
      cat[d.category]=(cat[d.category]||0)+d.amount;
    }
  });

  balance.innerText="Balance ₹"+(inc-exp);
  income.innerText="Income ₹"+inc;
  expense.innerText="Expense ₹"+exp;

  renderTable();
  renderCharts(cat);
}

// TABLE
function renderTable(){
  table.innerHTML="";
  getFiltered().slice(0,50).forEach(d=>{
    table.innerHTML+=`
    <tr>
      <td>${d.date}</td>
      <td>${d.desc}</td>
      <td>${d.category}</td>
      <td>${d.type}</td>
      <td>₹${d.amount}</td>
    </tr>`;
  });
}

// CHARTS
function renderCharts(cat){
  if(lineChart) lineChart.destroy();
  if(pieChart) pieChart.destroy();

  let ctx1=document.getElementById("lineChart").getContext("2d");
  let ctx2=document.getElementById("pieChart").getContext("2d");

  let bal=[],run=0;
  data.forEach(d=>{
    run+=d.type==="income"?d.amount:-d.amount;
    bal.push(run);
  });

  let color=getComputedStyle(document.documentElement).getPropertyValue('--primary');

  lineChart=new Chart(ctx1,{
    type:"line",
    data:{labels:bal,datasets:[{data:bal,borderColor:color}]}
  });

  pieChart=new Chart(ctx2,{
    type:"pie",
    data:{
      labels:Object.keys(cat),
      datasets:[{
        data:Object.values(cat),
        backgroundColor:['#22c55e','#3b82f6','#f97316','#ef4444','#8b5cf6']
      }]
    }
  });
}

// ADD
function addTransaction(){
  data.unshift({
    desc:desc.value,
    amount:parseInt(amount.value),
    type:type.value,
    category:type.value==="income"?"Salary":"Other",
    date:new Date().toISOString().split('T')[0]
  });
  render();
}

// THEME
function toggleTheme(){
  document.body.classList.toggle("light");
}

// COLOR
function changeThemeColor(){
  const colors={
    green:"#22c55e",
    blue:"#3b82f6",
    purple:"#8b5cf6",
    orange:"#f97316"
  };
  document.documentElement.style.setProperty('--primary',colors[themeColor.value]);
  render();
}

// EXPORT
function exportCSV(){
  let csv="Date,Amount\n";
  data.forEach(d=>csv+=`${d.date},${d.amount}\n`);
  let a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv]));
  a.download="data.csv";
  a.click();
}

function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF();

  let y=10;
  data.slice(0,30).forEach(d=>{
    doc.text(`${d.date} ${d.desc} ₹${d.amount}`,10,y);
    y+=8;
  });

  doc.save("report.pdf");
}