// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var verificationCtx = $("#myVerificationChart");
var status = $("#userStatus")[0].innerHTML;
var myVerificationChart;
if (status == "Basic") {
  myVerificationChart = new Chart(verificationCtx, {
    type: 'doughnut',
    data: {
      labels: ["Full Verification", "Basic Verification"],
      datasets: [{
        data: [50, 50],
        backgroundColor: ['#4e73df', '#1cc88a'],
        hoverBackgroundColor: ['#2e59d9', '#17a673'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
      rotation: 0.75,
    },
  });
} else {
  myVerificationChart = new Chart(verificationCtx, {
    type: 'doughnut',
    data: {
      labels: ["Full Verification", "Basic Verification"],
      datasets: [{
        data: [50, 50],
        backgroundColor: ['#1cc88a', '#1cc88a'],
        hoverBackgroundColor: ['#17a673', '#17a673'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
      rotation: 0.75,
    },
  });
}