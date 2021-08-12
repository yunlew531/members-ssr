const membersListEl = document.getElementById('membersListEl');
const memberInputEl = document.getElementById('memberInputEl');
const selectEl = document.getElementById('selectEl');
const reverseBtnEl = document.getElementById('reverseBtnEl');
const addBtnEl = document.getElementById('addBtnEl');
const resetBtnEl = document.getElementById('resetBtnEl');
const rangePanel = document.getElementById('rangePanel');
const rangeTitleEl = document.getElementById('rangeTitleEl');
const rangeMinInputEl = document.getElementById('rangeMinInputEl');
const rangeMaxInputEl = document.getElementById('rangeMaxInputEl');

let isReverse = false;
let minVal = null;
let maxVal = null;
const APP_URL = 'https://members-ssr.herokuapp.com';

const getList = () => {
  const sort = selectEl.value || 'title';
  return new Promise((resolve, reject) => {
    axios.get(`${APP_URL}/members/list/${sort}`)
      .then((res) => {
        const { members } = res.data;
        resolve(members);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const showRangePanel = () => {
  if(selectEl.value !== 'member') rangePanel.classList.remove('hidden');
  else rangePanel.classList.add('hidden');
  rangeTitleEl.textContent =  `${selectEl.value} range`;
};

const validate = (member) => {
  const { age, weight, height } = member;
  const hasEmpty = Object.values(member).some((val) => !val);
  const isZero = age < 1 || weight < 1 || height < 1;
  const hasError = isZero || hasEmpty;
  if(hasError) alert('請確認是否輸入正確!');
  return hasError;
};

const renderList = (members) => {
  let data = [ ...members ];
  if(isReverse) data.reverse();
  let str = '';
  data.forEach((member) => {
    const template = `
      <tr data-id="${member.id}" class="member-card bg-gray-800 relative">
        <td class="p-3">${member.title}</td>
        <td class="p-3">${member.age}</td>
        <td class="p-3 font-bold">${member.weight}</td>
        <td class="p-3">${member.height}</td>
        <td class="p-3">
          <a href="javascript:;" class="text-gray-400 hover:text-gray-100 mx-2">
            <i class="edit-btn material-icons-outlined text-base">edit</i>
          </a>
          <a href="javascript:;" class="text-red-400 hover:text-red-700 ml-2">
            <i class="remove-btn material-icons-round text-base">delete_outline</i>
          </a>
        </td>
        <td class="edit-container text-gray-800 invisible opacity-0 duration-300
          absolute bg-gray-50 rounded top-1/2 transform -translate-y-1/2 ml-5 p-3">
          <span class="edit-triangle absolute bg-gray-50 block top-1/2 -left-3.5
            transform -translate-y-1/2 p-2"></span>
          <div class="text-right leading-none">
            <span class="close-edit-container-btn material-icons-outlined cursor-pointer
              text-red-500 hover:text-red-700">close</span>
          </div>
          <div class="flex py-1">
            <label for="${member.id + member.title}" class="w-12">member</label>
            <input id="${member.id + member.title}"
              type="text" placeholder="member" value="${member.title}"
              class="member-input w-32 border border-gray-500 rounded px-2 ml-3">
          </div>
          <div class="flex py-1">
            <label for="${member.id + member.age}" class="w-12">age</label>
            <input id="${member.id + member.age}"
              type="number" placeholder="age" min="1" value="${member.age}"
              class="age-input w-32 border border-gray-500 rounded px-2 ml-3">
          </div>
          <div class="flex py-1">
            <label for="${member.id + member.weight}" class="w-12">weight</label>
            <input id="${member.id + member.weight}"
              type="number" placeholder="weight" min="1" value="${member.weight}"
              class="weight-input w-32 border border-gray-500 rounded px-2 ml-3">
          </div>
          <div class="flex py-1">
            <label for="${member.id + member.height}" class="w-12">height</label>
            <input id="${member.id + member.height}"
              type="number" placeholder="height" min="1" value="${member.height}"
              class="height-input w-32 border border-gray-500 rounded px-2 ml-3">
          </div>
          <div class="text-right mt-2">
            <button type="button" class="submit-edit-btn bg-gray-300 hover:bg-gray-400 
              rounded px-3 py-1">
              Submit
            </button>
          </div>
        </td>
      </tr>
    `;
    str+=template;
  });
  membersListEl.innerHTML = str;
};

const addMember = () => {
  const member = {
    title: memberInputEl.value.trim(),
    age: parseInt(ageInputEl.value),
    weight: parseInt(weightInputEl.value),
    height: parseInt(heightInputEl.value),
  }
  const hasError = validate(member);
  if (!hasError) {
    axios.post(`${APP_URL}/members/add`, { data: member })
      .then((res) => {
        const { message } = res.data;
        memberInputEl.value = '';
        ageInputEl.value = '';
        weightInputEl.value = '';
        heightInputEl.value = '';
        alert(message);
        return getList();
      })
      .then((members) => {
        renderList(members);
      })
      .catch((err) => {
        const { message } = err.response.data;
        alert(message);
      });
  };
};

const removeMember = (e, id) => {
  const targetCard = e.target.closest('tr');
  targetCard.classList.add('disabled');
  axios.delete(`${APP_URL}/members/${id}`)
    .then((res) => {
      const { message } = res.data;
      alert(message);
      return getList();
    })
    .then((members) => {
      renderList(members);
    })
    .catch((err) => {
      alert(err.response.data.message)
      targetCard.classList.remove('disabled');
    });
};

const closeEditContainer = () => {
  document.querySelectorAll('.edit-container')
    .forEach((el) => el.classList.add('invisible', 'opacity-0'));
};

const showEditContainer = (e, id) => {
  const editContainer = e.target.closest('tr').querySelector('.edit-container');
  closeEditContainer();
  editContainer.classList.remove('invisible', 'opacity-0');
};

const submitEdit = (e, id) => {
  const targetCard = e.target.closest('tr');
  targetCard.classList.add('disabled');
  const memberInputEl = targetCard.querySelector('.member-input');
  const ageInputEl = targetCard.querySelector('.age-input');
  const weightInputEl = targetCard.querySelector('.weight-input');
  const heightInputEl = targetCard.querySelector('.height-input');
  const member = {
    title: memberInputEl.value.trim(),
    age: parseInt(ageInputEl.value),
    weight: parseInt(weightInputEl.value),
    height: parseInt(heightInputEl.value),
    id,
  };
  const hasError = validate(member);
  if(!hasError) {
    closeEditContainer();
    axios.post(`${APP_URL}/members/edit`, { data: member })
      .then((res) => {
        const { message } = res.data;
        alert(message);
        return getList();
      })
      .then((members) => {
        renderList(members);
      })
      .catch((err) => {
        console.dir(err);
        targetCard.classList.remove('disabled');
      });
  };
};

const actionMember = (e) => {
  const classList = [ ...e.target.classList ];
  const targetCart = e.target.closest('tr');
  if(targetCart) {
    const { id } = targetCart.dataset;
    if(classList.includes('remove-btn')) removeMember(e, id);
    else if(classList.includes('edit-btn')) showEditContainer(e, id);
    else if(classList.includes('close-edit-container-btn')) closeEditContainer();
    else if(classList.includes('submit-edit-btn')) submitEdit(e, id);
  }
};

const resetData = () => {
  isReverse = false;
  reverseBtnEl.classList.remove('bg-gray-400');
  selectEl.value = '';
  axios.post(`${APP_URL}/members/reset`)
    .then((res) => {
      const { members } = res.data;
      renderList(members);
    });
};

const sortCategory = () => {
  const data = { sort: selectEl.value }
  axios.post(`${APP_URL}/members/sort`, { data }).then((res) => {
    const { members } = res.data;
    renderList(members);
  });
};

const init = () => {
  setTimeout(() => {
    membersListEl.classList.remove('hide-edit');
  }, 300);
};
init();

selectEl.addEventListener('change', sortCategory);

addBtnEl.addEventListener('click', addMember);
reverseBtnEl.addEventListener('click', () => {
  isReverse = !isReverse;
  if(isReverse) reverseBtnEl.classList.add('bg-gray-400');
  else reverseBtnEl.classList.remove('bg-gray-400');
  getList().then((members) => {
    renderList(members);
  });
});

membersListEl.addEventListener('click', actionMember);
resetBtnEl.addEventListener('click', resetData);
rangeMinInputEl.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    const min = parseInt(rangeMinInputEl.value);
    minVal = min;
    renderList();
  }
});

rangeMaxInputEl.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    const max = parseInt(rangeMaxInputEl.value);
    maxVal = max;
    renderList();
  }
});
