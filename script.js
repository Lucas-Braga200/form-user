$(() => {
  const viacepAPI = 'https://viacep.com.br/ws/';

  const inputCEP = document.getElementById('cep');
  const inputTel = document.getElementById('tel');
  const inputEmail = document.getElementById('email');
  const button = document.getElementById('register-button');

  const maskCEP = IMask(inputCEP, {
    mask: '00.000-000',
  });
  const maskTel = IMask(inputTel, {
    mask: '(00) 0000-0000'
  });
  const maskEmail = IMask(inputEmail, {
    mask: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  });

  $(inputTel).keypress(function () {
    let value = maskTel.unmaskedValue;
    if (value.toString().length >= 10) {
      maskTel.updateOptions({ mask: '(00) 00000-0000' });
    } else {
      maskTel.updateOptions({ mask: '(00) 0000-0000' });
    }
  });
  $(inputCEP).keypress(event => {
    removeInputError(inputCEP, $('#cep-error'));
    if (event.keyCode == '13') {
      getCEP();
    }
    $('#cep-result').text('');
  });

  $(button).click(getCEP);

  function getCEP() {
    const valueCEP = $(inputCEP).val();
    if (isCEP(valueCEP)) {
      fetch(viacepAPI + `${valueCEP.replace(".","")}/json/`)
        .then(response => response.json())
        .then(response => {
          if (response.erro == 'true') {
            showInputError($('#cep'), $('#cep-error'), 'Este CEP não existe.');
          } else {
            let result = `${response.logradouro} - ${response.bairro} - ${response.localidade}/${response.uf}`;
            $('#cep-result').text(result);
          }
        })
        .catch(err => console.log(err));
    } else {
      showInputError($('#cep'), $('#cep-error'), 'CEP não está no formato válido.');
    }
  }

  function isCEP(cep) {
    var pattern = /^[0-9]{2}\.[0-9]{3}-[0-9]{3}$/;
    if (cep.length > 0) {
      if (pattern.test(cep)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function showInputError(input, alert, message) {
    $(input).addClass('warning');
    $(alert).text(message);
  }
  function removeInputError(input, alert) {
    $(input).removeClass('warning');
    $(alert).text('');
  }
});
