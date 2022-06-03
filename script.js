faker.locale = 'pt_BR';

const viacepAPI = 'https://viacep.com.br/ws/';

const inputName = document.getElementById('name');
const inputCEP = document.getElementById('cep');
const inputTel = document.getElementById('tel');
const inputEmail = document.getElementById('email');
const button = document.getElementById('register-button');
const randomButton = document.getElementById('random-button');
const searchButton = document.getElementById('search-cep');
const userTableBody = document.getElementById('user-table-body');

const emptyMessage = $('<tr><td class="table-data-empty" colspan="4">Não há nenhum usuário...</td></tr>');
const spinner = $(`
<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>`);

const users = new Array();

const maskCEP = IMask(inputCEP, {
  mask: '00.000-000',
});
const maskTel = IMask(inputTel, {
  mask: [
    {
      mask: '(00) 0000-0000'
    },
    {
      mask: '(00) 00000-0000'
    }
  ]
});

$(inputCEP).keypress(event => {
  removeInputError(inputCEP, $('#cep-error'));
  if (event.keyCode == '13') {
    storeUser();
  }
  $('#cep-result').text('');
});
$(inputTel).keypress(event => {
  removeInputError(inputTel, $('#tel-error'));
});
$(inputEmail).keypress(event => {
  removeInputError(inputEmail, $('#email-error'));
});
$(inputName).keypress(event => {
  removeInputError(inputName, $('#name-error'));
});

$(button).click(storeUser);
$(randomButton).click(generateUser);
$(searchButton).click(searchCEP);

function storeUser() {
  const name = getName();
  const tel = getTel();
  const email = getEmail();
  const cep = getCEP();
  if (!(name == null || tel == null || email == null || cep == null)) {
    addSpinner();
    fetch(viacepAPI + `${cep.replace(".","")}/json/`)
      .then(response => response.json())
      .then(response => {
        if (response.erro == 'true') {
          showInputError($('#cep'), $('#cep-error'), 'Este CEP não existe.');
        } else {
          let result = `${response.logradouro} - ${response.bairro} - ${response.localidade}/${response.uf}`;
          $('#cep-result').text(result);
          const user = {
            name,
            tel,
            email,
            cep: result
          };
          addUserToTable(user);
          users.push(user);
        }
      })
      .catch(err => console.log(err))
      .finally(() => removeSpinner());
  }
}

function generateUser() {
  removeInputError(inputCEP, $('#cep-error'));
  $('#cep-result').text('');
  removeInputError(inputName, $('#name-error'));
  removeInputError(inputEmail, $('#email-error'));
  removeInputError(inputTel, $('#tel-error'));
  getRandomName();
  getRandomCEP();
  getRandomEmail();
  getRandomTel();
}

function getName() {
  const valueName = $(inputName).val();
  if (!isName(valueName)) {
    showInputError($('#name'), $('#name-error'), 'Nome não pode ser vazio.');
    return null;
  }
  return valueName;
}

function getTel() {
  const valueTel = $(inputTel).val();
  if (!isTel(valueTel.replace(".",""))) {
    showInputError($('#tel'), $('#tel-error'), 'Telefone não está no formato válido.');
    return null;
  }
  return valueTel;
}

function getEmail() {
  const valueEmail = $(inputEmail).val();
  if (!isEmail(valueEmail)) {
    showInputError($('#email'), $('#email-error'), 'Email não está no formato válido.');
    return null;
  }
  return valueEmail;
}

function getCEP() {
  const valueCEP = $(inputCEP).val();
  if (!isCEP(valueCEP)) {
    showInputError($('#cep'), $('#cep-error'), 'CEP não está no formato válido.');
    return null;
  }
  return valueCEP;
}

function searchCEP() {
  const valueCEP = $(inputCEP).val();
  if (isCEP(valueCEP)) {
    addSpinner();
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
      .catch(err => console.log(err))
      .finally(() => removeSpinner());
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

function isEmail(email) {
  var pattern = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (email.length > 0) {
    if (pattern.test(email)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function isTel(tel) {
  if (tel.length >= 10) {
    return true;
  } else {
    return false;
  }
}

function isName(name) {
  if (name.length != 0) {
    return true; 
  } else {
    return false;
  }
}

function getRandomName() {
  $(inputName).val(faker.name.findName());
}

function getRandomEmail() {
  $(inputEmail).val(faker.internet.email());
}

function getRandomTel() {
  maskTel.value = faker.phone.phoneNumber('##########');
}

function getRandomCEP() {
  maskCEP.value = faker.address.zipCode('########');
}

function updateTable() {
  if (!users.length) {
    $(userTableBody).append(emptyMessage);
  } else {
    $(userTableBody).html('');
    for (let i = 0; i < users.length; i++) {
      addUserToTable(users[i]);
    }
  }
}

function addUserToTable(user) {
  if (!users.length) {
    $(userTableBody).html('');
  }

  const tableRow = document.createElement('tr');
  $(tableRow).append(`<td class="table-data">${user.name}</td>`);
  $(tableRow).append(`<td class="table-data">${user.email}</td>`);
  $(tableRow).append(`<td class="table-data">${user.tel}</td>`);
  $(tableRow).append(`<td class="table-data">${user.cep}</td>`);

  $(userTableBody).append(tableRow);
}

function addSpinner() {
  $(searchButton).html('');
  $(searchButton).append($(spinner).clone());
  $(searchButton).append('Consultar');
  $(searchButton).attr('disabled', true);

  $(button).html('');
  $(button).append($(spinner).clone());
  $(button).append('Cadastrar');
  $(button).attr('disabled', true);
}

function removeSpinner() {
  $(searchButton).html('Consultar');
  $(searchButton).removeAttr('disabled');

  $(button).html('Cadastrar');
  $(button).removeAttr('disabled');
}

function showInputError(input, alert, message) {
  $(input).addClass('warning');
  $(alert).text(message);
}
function removeInputError(input, alert) {
  $(input).removeClass('warning');
  $(alert).text('');
}

updateTable();
