function showTab(n) {
    // This function will display the specified tab of the form...
    $(".signup-form form .tab").eq(n).removeClass("d-none");
    var x = $(".signup-form form > .tab");
    //... and fix the Previous/Next buttons:
    if (n == 0) {
        $(".signup-form #prevBtn").addClass("d-none");
    } else {
        $(".signup-form #prevBtn").removeClass("d-none");
    }
    if (n == (x.length - 1)) {
        $(".signup-form #prevBtn").attr("onclick", "nextPrev(-2,3)");
        $(".signup-form #nextBtn").attr("onclick", "nextPrev(1,3)");
        $(".signup-form #nextBtn").text("Submit");
        $(".signup-form #user").text($(".signup-form #firstName").val());
    } else if (n == 2) {
        $(".signup-form #prevBtn").attr("onclick", "nextPrev(-1,2)");
        $(".signup-form #nextBtn").attr("onclick", "nextPrev(1,2)");
        $(".signup-form #nextBtn").text("Next");
    } else if (n == 1) {
        $(".signup-form #prevBtn").attr("onclick", "nextPrev(-1,1)");
        $(".signup-form #nextBtn").attr("onclick", "sendOTP(1)");
        $(".signup-form #nextBtn").text("Send");
        $(".signup-form #code").val("");
        $(".signup-form #sendOTP").text("");
    } else {
        $(".signup-form #errorSendOtp").hide();
        $(".signup-form #mobileNum").val("");
        $(".signup-form #password, .signup-form #confirmPassword").val("");
        $(".signup-form #nextBtn").attr("onclick", "nextPrev(1,0)");
        $(".signup-form #nextBtn").text("Next");
    }
    //... and run a function that will display the correct step indicator:
    fixStepIndicator(n)
}

function nextPrev(n, currentTab) {
    // This function will figure out which tab to display
    var x = $(".signup-form form > .tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm(currentTab)) return false;
    // When end of the form

    if (currentTab == (x.length - 1) && Math.sign(n) == 1) {
        $("#loader").show();
        $(".signup-form").addClass("d-none");
    } else {
        // Hide the current tab:
        $(".signup-form form .tab").eq(currentTab).addClass("d-none");
    }

    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
        // ... the form gets submitted:
        $(".signup-form #regForm").submit();
        return false;
    } else {
        // Otherwise, display the correct tab:
        showTab(currentTab);
    }
}

function validateForm(currentTab) {
    // This function deals with validation of the form fields
    var y, z, i, valid = true;
    y = $(".signup-form form .tab:eq(" + currentTab + ") input");
    z = $(".signup-form form .tab:eq(" + currentTab + ") select");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
        // Skip accountName and accountNum in validations...
        if (y[i].id == "accountName" || y[i].id == "accountNum") {
            valid = true;
            $(y[i]).removeClass('is-invalid');
            $(y[i]).next().text("");
        } else {
            // If a field is empty...
            if (y[i].value == "") {
                // add an "invalid" class to the field:
                $(y[i]).addClass('is-invalid');
                $(y[i]).next().text("This is required.");
                // and set the current valid status to false
                valid = false;
            } else {
                // remove an "invalid" class to the field:
                $(y[i]).removeClass('is-invalid');
                $(y[i]).next().text("");

                // and set the current valid status to false
                if (y[i].id == "username" || y[i].id == "password" || y[i].id == "mobileNum" || y[i].id == "code") {
                    if (y[i].value.length < y[i].minLength) {
                        valid = false;
                        if (y[i].id == "mobileNum") $(".signup-form #errorSendOtp").hide();
                        $(y[i]).addClass('is-invalid');
                        $(y[i]).next().text('Length is short, minimum ' + y[i].minLength + 'characters required.');
                    }
                }
                if (y[i].id == "confirmPassword" && y[i].value != $('#password').val()) {
                    valid = false;
                    $(y[i]).addClass('is-invalid');
                    $(y[i]).next().text("Passwords Do Not Match!");
                }
            }
        }
    }
    // A loop that checks every select field in the current tab:
    for (i = 0; i < z.length; i++) {
        if (z[i].value == "") {
            // add an "invalid" class to the field:
            $(z[i]).addClass('is-invalid');
            $(z[i]).next().text("This is required.");
            // and set the current valid status to false
            valid = false;
        } else {
            // add an "invalid" class to the field:
            $(z[i]).removeClass('is-invalid');
            $(z[i]).next().text("");
            // and set the current valid status to false
        }
    }
    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        $(".step").eq(currentTab).addClass("finish");
    }
    return valid; // return the valid status
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    $(".signup-form .step").removeClass("active");
    //... and adds the "active" class on the current step:
    $(".signup-form .step").eq(n).addClass("active");
}

function formatName(f) {
    return f
        .replace(/[^A-z-.' ]/ig, "")
        .replace(/\^/g, "")
        .replace(/\[/g, "")
        .replace(/\`/g, "")
        .replace(/\~/g, "")
        .replace(/\]/g, "")
        .replace(/\_/g, "")
        .replace(/\\/g, "")
        .replace(/\ \ /g, "")
        .replace(/\.\./g, "")
        .replace(/\-\-/g, "")
        .replace(/\'\'/g, "")
        .replace(/\.\ \./g, "")
        .replace(/\-\ \-/g, "")
        .replace(/\'\ \'/g, "");
}

function formatAddress(f) {
    return f
        .replace(/[^A-z0-9-.,' ]/ig, "")
        .replace(/\^/g, "")
        .replace(/\[/g, "")
        .replace(/\`/g, "")
        .replace(/\~/g, "")
        .replace(/\]/g, "")
        .replace(/\_/g, "")
        .replace(/\\/g, "")
        .replace(/\ \ /g, "")
        .replace(/\.\./g, "")
        .replace(/\-\-/g, "")
        .replace(/\'\'/g, "")
        .replace(/\,\,/g, "")
        .replace(/\.\ \./g, "")
        .replace(/\-\ \-/g, "")
        .replace(/\'\ \'/g, "")
        .replace(/\,\ \,/g, "");
}

function formatEmail(f) {
    return f
        .replace(/[^A-z0-9@.]/ig, '')
        .replace(/\^/g, "")
        .replace(/\`/g, "")
        .replace(/\~/g, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "")
        .replace(/\\/g, "")
        .replace(/\.\./g, "")
        .replace(/\@\@/g, "")
        .replace(/\_\_/g, "")
        .replace(/\ \ /g, "");
}

function formatNumber(f) {
    return f
        .replace(/[^0-9-]/ig, '');
}

function formatMsgs(f) {
    return f
        .replace(/[^A-z0-9-.,'?! ]/ig, '')
        .replace(/\^/g, "")
        .replace(/\[/g, "")
        .replace(/\`/g, "")
        .replace(/\~/g, "")
        .replace(/\]/g, "")
        .replace(/\_/g, "")
        .replace(/\\/g, "")
        .replace(/\ \ /g, "")
        .replace(/\.\./g, "")
        .replace(/\-\-/g, "")
        .replace(/\'\'/g, "")
        .replace(/\,\,/g, "")
        .replace(/\.\ \./g, "")
        .replace(/\-\ \-/g, "")
        .replace(/\'\ \'/g, "")
        .replace(/\,\ \,/g, "");
}

function formatUsername(f) {
    return f
        .replace(/[^A-z0-9]/ig, "")
        .replace(/\^/g, "")
        .replace(/\[/g, "")
        .replace(/\`/g, "")
        .replace(/\~/g, "")
        .replace(/\]/g, "")
        .replace(/\_\_/g, "")
        .replace(/\\/g, "")
        .replace(/\ \ /g, "")
        .replace(/\.\./g, "")
        .replace(/\-\-/g, "")
        .replace(/\'\'/g, "")
        .replace(/\.\ \./g, "")
        .replace(/\-\ \-/g, "")
        .replace(/\'\ \'/g, "");
}

function showPassword() {
    var x = $(".login-form #password");
    if ($(".login-form #password").attr("type") === "password") {
        $(".login-form #password").attr("type", "text");
    } else {
        $(".login-form #password").attr("type", "password");
    }
}

function formatPass(f) {
    return f.replace(/\ /g, "");
}

function checkMinLength(name, minLength) {
    if ($("input").attr("id", name).val().length > 0) {
        if ($("input").attr("id", name).val().length < minLength) {
            $("input").attr("id", name).parent().addClass("is-invalid");
            if (name == "mobileNum") {
                $("input").attr("id", name).parent().next().text('Length is short, minimum ' + minLength + 'digits required.');
            } else {
                $("input").attr("id", name).parent().text('Length is short, minimum ' + minLength + 'characters required.');
            }
        }
    }
}

function checkMaxLength(name, maxLength) {
    if ($("input").attr("id", name).val().length > 0) {
        if ($("input").attr("id", name).val().length > maxLength) {
            $("input").attr("id", name).parent().addClass("is-invalid");
            if (name == "mobileNum") {
                $("input").attr("id", name).parent().next().text('Length is not valid, maximum ' + maxLength + 'digits allowed.');
            } else {
                $("input").attr("id", name).parent().text('Length is not valid, maximum ' + maxLength + 'characters allowed.');
            }
        }
    }
}

function checkPass() {
    var password = $('.signup-form #password').val();
    var password2 = $(".signup-form #confirmPassword").val();
    if (password && password2) {
        if (password !== password2.value) {
            $(".signup-form #confirmPassword").parent().addClass("is-invalid");
            $(".signup-form #confirmPassword").next().text("Passwords Do Not Match!");
        } else {
            $(".signup-form #confirmPassword").next().text("");
        }
    }
}

function getAge(dateString) {
    let today = new Date();
    let dateOfBirth = new Date(dateString);
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    let m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }
    return age;
}

function formatDate(paramDate, format) {
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month2 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    //let month3 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date = paramDate.toString().split(' ');
    return date[3] + '-' + month2[month.indexOf(date[1])] + '-' + date[2];
}

function dateNowMinusYrs(paramYrs) {
    let d = new Date();
    d.setFullYear(d.getFullYear() - paramYrs, d.getMonth(), d.getDate());
    return d;
}

function formatNumberWithCommas(yourNumber) {
    if (yourNumber != "" || yourNumber != null || yourNumber != undefined) {
        let n = yourNumber.toString().split(".");
        if (n.length == 1) n[1] = '00';
        n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return n.join(".");
    } else {
        return 0.00;
    }
}

function ROUND(num) {
    let newNum = +(Math.round(parseFloat(num) + "e+2") + "e-2");
    return (Number.isNaN(newNum)) ? (num.toFixed(2) == 0) ? 0.00 : num.toFixed(2) : newNum;
}

function formatCurrency(num, withoutDecimals) {
    if (!num) {
        return "0.00";
    }
    num = convertCurrencyToNumber(num);
    if (withoutDecimals) {
        num = ROUND(num, 0);
        sign = (num == (num = Math.abs(num)));
        num = Math.floor(num * 100 + 0.50000000001);
        cents = num % 100;
        num = Math.floor(num / 100).toString();
        if (cents < 10)
            cents = "0" + cents;
        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
            num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
        return (((sign) ? '' : '-') + num);
    }

    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
        num.substring(num.length - (4 * i + 3));

    return (((sign) ? '' : '-') + num + '.' + cents);
}

function convertCurrencyToNumber(currency) {
    var formattedCurrency = currency.toString().replace(/\$|\,| /g, '');
    if (isNaN(formattedCurrency)) {
        formattedCurrency = "0";
    }
    return formattedCurrency;
}

function formatTextAsDecimal(text) {
    return parseFloat(convertCurrencyToNumber(text)) || 0;
}

function getMonthlyPayment(a, r, n) {
    let p = a / ([Math.pow(1 + r, n) - 1] / [r * Math.pow(1 + r, n)]);
    return p;
}

function zoom(direction) {
    var slider = $('input[name="range"]');
    var step = parseInt(slider.attr('step'), 10);
    var currentSliderValue = parseInt(slider.val(), 10);
    var newStepValue = currentSliderValue + step;

    if (direction === "out") {
        newStepValue = currentSliderValue - step;
    } else {
        newStepValue = currentSliderValue + step;
    }

    slider.val(newStepValue).change();
};

function sendOTP(currentTab) {
    if (validateForm(currentTab)) {
        var token = $('input[name="_csrf"]').attr('value');
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRF-Token', token);
            }
        });
        $.ajax({
            url: "/api/sendOTP",
            type: "POST",
            data: {
                mobileNum: $('input[name="mobileNum"]').val(),
                name: $('input[name="firstName"]').val()
            },
            cache: false,
            success: function (data) {
                $("#sendOTP").text(data.message);
                nextPrev(1, currentTab);
            },
            error: function (xhr, status, error) {
                $("#errorSendOtp").show().text(xhr.responseJSON.message);
            }
        });
    }

}