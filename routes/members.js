const express = require('express');
const router = express.Router();

const firebaseAdminDb = require('../connections/firebase_admin');
const membersRef = firebaseAdminDb.ref('members');

const getList = (sort) => {
  let promise = null;
  if(sort) {
    promise = new Promise((resolve, reject) => {
      membersRef.orderByChild(sort).once('value', (snapshot) => {
        const members = [];
        snapshot.forEach((member) => {
          members.push(member.val());
        });
        resolve(members);
      });
    });
  } else {
    promise = new Promise((resolve, reject) => {
      membersRef.once('value', (snapshot) => {
        const members = [];
        snapshot.forEach((member) => {
          members.push(member.val());
        });
        resolve(members);
      });
    });
  }
  return promise;
};

const validate = (data) => {
  const { title, age, weight, height } = data;
  const numArr = [ age, weight, height ];
  const hasError = (typeof title !== 'string' || !title)
    || (numArr.some((item) => typeof item !== 'number' || item < 1));
  return hasError;
};

/* GET users listing. */
router.get('/', (req, res, next) => {
  getList().then((members) => {
    res.render('members', {
      title: 'Members',
      members,
      styleSheets: '<link rel="stylesheet" href="stylesheets/members.css">',
    });
  });
});

router.get('/list/:sort', (req, res, next) => {
  const { sort } = req.params;
  getList(sort).then((members) => {
    res.send({ members });
  });
});

router.post('/reset', (req, res, next) => {
  membersRef.set({
    '-MgtZRX8tSXpSMxYgF_l': {
      age: 3,
      height: 15,
      title: 'Dog',
      weight: 20,
      id: '-MgtZRX8tSXpSMxYgF_l',
    },
    '-Mgt_-VWzy4JO3FhZSm-': {
      age: 13,
      height: 133,
      title: 'Zack',
      weight: 100,
      id: '-Mgt_-VWzy4JO3FhZSm-',
    },
    '-MgtZRlkv9gSOWFOnrFR': {
      age: 44,
      height: 178,
      title: 'John',
      weight: 88,
      id: '-MgtZRlkv9gSOWFOnrFR',
    },
    '-MgtZ_EUXR_uZigBMjGM': {
      age: 42,
      height: 166,
      title: 'Sansa',
      weight: 66,
      id: '-MgtZ_EUXR_uZigBMjGM',
    },
    '-MgtZ_SXUZbgpiryNVKT': {
      age: 10,
      height: 155,
      title: 'Alisa',
      weight: 35,
      id: '-MgtZ_SXUZbgpiryNVKT',
    },
  })
  .then(getList)
  .then((members) => {
    res.send({ success: true, members });
  });
});

router.post('/add', (req, res, next) => {
  const { data } = req.body;
  const hasError = validate(data);
  if(!hasError) {
    const memberRef = membersRef.push();
    const { key } = memberRef;
    memberRef.set({ id: key, ...data })
      .then(() => {
        res.send({
          success: true,
          message: '成功新增!',
        });
      });
  } else {
    res.status(400).send({
      success: false,
      message: '請確認格式是否正確!',
    });
  };
});

router.post('/edit', (req, res, next) => {
  const { data } = req.body;
  const hasError = validate(data);
  if(!hasError) {
    membersRef.child(data.id).set(data).then(() => {
      res.send({
        success: true,
        message: '成功更新!',
      });
    });
  } else {
    res.status(400).send({
      success: false,
      message: '格式有誤!',
    });
  }
});

router.post('/sort', (req, res, next) => {
  const { sort } = req.body.data;
  if(sort) {
    getList(sort).then((members) => {
      res.send({
        success: true,
        members,
      })
    })
  } else {
    res.status(400).send({
      success: false,
      message: '格式有誤!',
    })
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  membersRef.orderByKey().equalTo(id).once('value', (snapshot) => {
    const target = snapshot.val();
    if(target) {
      membersRef.child(id).remove()
        .then(() => {
          res.send({ success: true, message: '已刪除成員!' });
        });
    } else {
      res.status(400).send({
        success: false,
        message: '找不到此id，請確認id是否存在!',
      });
    }
  });
});

module.exports = router;
