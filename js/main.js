(function ($) {
    "use strict";

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function() {
        $(this).on('blur', function() {
            if ($(this).val().trim() != "") {
                $(this).addClass('has-val');
            } else {
                $(this).removeClass('has-val');
            }
        });
    });

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(e) {
        e.preventDefault(); // Ngăn form submit mặc định

        var check = true;
        var id = $("input[name='id']").val().trim();
        var password = $("input[name='pass']").val().trim();

        // Kiểm tra các trường đầu vào có hợp lệ không
        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        // Kiểm tra ID và mật khẩu
        if (check && id === "admin" && password === "0") {
            // Chuyển hướng đến Data_Analysis.html khi đăng nhập thành công
            window.location.href = "Data_Analysis.html";
        } else if (check && id === "admin" && password === "1")
        {
            window.location.href = "Product_Classification.html"
        } else if (check && id === "admin" && password === "2")
            {
                window.location.href = "Load_image_JS_server.html"
            }
         else if (check) {
            alert("Sai ID hoặc mật khẩu!");
        }

        return false;
    });

    $('.validate-form .input100').each(function() {
        $(this).focus(function() {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('name') == 'id') {
            if ($(input).val().trim() == '') {
                return false;
            }
        } else if ($(input).attr('name') == 'pass') {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
        return true;
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function() {
        if (showPass == 0) {
            $(this).next('input').attr('type', 'text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        } else {
            $(this).next('input').attr('type', 'password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
    });
    document.querySelector(".login100-form-btn").addEventListener("click", function () {
        const homeID = document.getElementById("home-id-input").value;
        sessionStorage.setItem("homeID", homeID);
    });
    

})(jQuery);
