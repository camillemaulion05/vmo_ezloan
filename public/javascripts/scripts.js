/*!
 * Start Bootstrap - Agency v6.0.3 (https://startbootstrap.com/theme/agency)
 * Copyright 2013-2020 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
 */
(function ($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (
            location.pathname.replace(/^\//, "") ==
            this.pathname.replace(/^\//, "") &&
            location.hostname == this.hostname
        ) {
            var target = $(this.hash);
            target = target.length ?
                target :
                $("[name=" + this.hash.slice(1) + "]");
            if (target.length) {
                $("html, body").animate({
                        scrollTop: target.offset().top - 72,
                    },
                    1000,
                    "easeInOutExpo"
                );
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $(".js-scroll-trigger").click(function () {
        $(".navbar-collapse").collapse("hide");
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $("body").scrollspy({
        target: "#mainNav",
        offset: 74,
    });

    // Collapse Navbar
    var navbarCollapse = function () {
        if ($("#mainNav").length != 0) {
            if ($("#mainNav").offset().top > 100) {
                $("#mainNav").addClass("navbar-shrink");
            } else {
                $("#mainNav").removeClass("navbar-shrink");
            }
        }
    };
    // Collapse now if page is not at top
    navbarCollapse();
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);

    /*UPDATES - Add script for carousel*/
    $('#carousel-example').on('slide.bs.carousel', function (e) {
        var $e = $(e.relatedTarget);
        var idx = $e.index();
        // console.log("IDX :  " + idx);
        var itemsPerSlide = 6;
        var totalItems = $('.carousel-item').length;
        if (idx >= totalItems - (itemsPerSlide - 1)) {
            var it = itemsPerSlide - (totalItems - idx);
            for (var i = 0; i < it; i++) {
                // append slides to end
                if (e.direction == "left") {
                    $('.carousel-item').eq(i).appendTo('.carousel-inner');
                } else {
                    $('.carousel-item').eq(0).appendTo('.carousel-inner');
                }
            }
        }
    });

    $("form#contactForm").validate({
        rules: {
            firstName: "required",
            lastName: "required",
            email: "required",
            message: "required"
        },
        messages: {
            firstName: "Please enter your first name.",
            lastName: "Please enter your last name.",
            email: "Please enter your email address.",
            message: "Please enter a message."
        },
        errorElement: 'em',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        },
        submitHandler: function (form) {
            form.submit();
        }
    });

    $("form#forgotForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 8
            },
            question: "required",
            answer: "required"
        },
        messages: {
            username: {
                required: "Please enter your username.",
                minlength: "Length is short, minimum 8 characters required."
            },
            question: "Please select your security question.",
            answer: "Please enter your answer."
        },
        errorElement: 'em',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        },
        submitHandler: function (form) {
            form.submit();
        }
    });

    $("form#loginForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 8
            },
            password: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            username: {
                required: "Please enter your username.",
                minlength: "Length is short, minimum 8 characters required."
            },
            password: {
                required: "Please enter your password.",
                minlength: "Length is short, minimum 8 characters required."
            },
        },
        errorElement: 'em',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        },
        submitHandler: function (form) {
            form.submit();
        }
    });


    $("a[data-toggle=\"tab\"]").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
    });

    $(".container-first button#minus").click(function (event) {
        zoom("out");
    });

    $(".container-first button#plus").click(function (event) {
        zoom("in");
    });

    $('.container-first input[name="range"]').on('input change', function (event) {
        $('output[for="range"]').text(formatCurrency($(event.currentTarget).val(), true));
        var loanTerm = $('.container-first input[name="loan-period"]').val();
        var interest = $('.container-first input[name="interest"]').val() / 100;
        var amount = $(event.currentTarget).val();
        $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
    });

    $(".container-first input#six").click(function (event) {
        $('.container-first input[name="loan-period"]').val(6).change();
        $(".container-first input#six").parent().addClass('radio-container-checked');
        $(".container-first input#twelve").parent().removeClass('radio-container-checked');
        var loanTerm = $('.container-first input[name="loan-period"]').val();
        var interest = $('.container-first input[name="interest"]').val() / 100;
        var amount = $('.container-first input[name="range"]').val();
        $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
    });

    $(".container-first input#twelve").click(function (event) {
        $('.container-first input[name="loan-period"]').val(12).change();
        $(".container-first input#twelve").parent().addClass('radio-container-checked');
        $(".container-first input#six").parent().removeClass('radio-container-checked');
        var loanTerm = $('.container-first input[name="loan-period"]').val();
        var interest = $('.container-first input[name="interest"]').val() / 100;
        var amount = $('.container-first input[name="range"]').val();
        $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
    });

    $("form input").on("keyup change blur", function () {
        $(this).removeClass('is-invalid');
        $(this).next().text("");
    });

    $("form select").on("change blur", function () {
        $(this).removeClass('is-invalid');
        $(this).next().text("");
    });

    //form-validations
    $('input[name="mobile"]').on("keyup change blur", function () {
        var mobile = this.value;
        if (mobile.charAt(0) != '9') {
            this.value = '';
        };
        formatNumber(this.value);
        $("#number").text(this.value);
    });

    $("#name, #firstName, #lastName").on("keyup change blur", function () {
        $(this).val(formatName($(this).val()));
    });

    $('input[name="email"]').on("keyup change blur", function () {
        $(this).val(formatEmail($(this).val()));
    });

    $('input[name="message"]').on("keyup change blur", function () {
        $(this).val(formatMsgs($(this).val()));
    });

    $('input[name="username"]').on("keyup change blur", function () {
        $(this).val(formatUsername($(this).val()));
    });

    $("#password, #confirmPassword").on("keyup change blur", function () {
        $(this).val(formatPass($(this).val()));
    });

    $('input[name="code"]').on("keyup change blur", function () {
        $(this).val(formatNumber($(this).val()));
    });

    $('input[name="dateOfBirth"]').attr("min", formatDate(dateNowMinusYrs(65)));
    $('input[name="dateOfBirth"]').attr("max", formatDate(dateNowMinusYrs(21)));

    /*When clicking on Full hide fail/success boxes */
    $('form#contactForm input[name="name"]').focus(function () {
        $('form#contactForm div#success').html('');
    });
})(jQuery); // End of use strict