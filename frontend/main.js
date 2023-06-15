const SERVER_URL = 'http://localhost:3000'

async function serverAddStudent(obj){
    let response = await fetch(SERVER_URL + '/api/students',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(obj),
    })
    let data = await response.json()
    return data;
}

async function serverGetStudent(){
    let response = await fetch(SERVER_URL + '/api/students',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
    let data = await response.json()
    return data;
}

async function serverDeleteStudent(id){
    let response = await fetch(SERVER_URL + '/api/students/' + id,{
        method: 'DELETE',
    })
    let data = await response.json()
    return data;
}

let serverData = await serverGetStudent()

let listStudents = [
]

let sortColumnFlag = 'FIO',
    sortDirFlag = true

if (serverData){
    listStudents = serverData
}


function formatAge(dateString) {
  const birthday = new Date(dateString);
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return `${birthday.toLocaleDateString()} (${age} ${age === 1 ? 'год' : age < 5 ? 'года' : 'лет'})`;
}
function formatCourse(startYear) {
  const currentYear = new Date().getFullYear();
  const endYear = Number(startYear)  + 4;
  if (currentYear > endYear) {
    return `${startYear} (закончил)`;
  } else {
    const course = currentYear - startYear ;
    return `${startYear}(${course} ${course === 1 ? 'курс' : course < 5 ? 'курса' : 'курсов'})`;
  }
}
function $getNewStudentTR(studObj) {
    const $tr = document.createElement('tr')
    const $tdFIO = document.createElement('td')
    const $tdBirthday = document.createElement('td')
    const $tdFaculty = document.createElement('td')
    const $tdStudyStart = document.createElement('td')
    const $tdDelete = document.createElement('td')
    const $btnDelete = document.createElement('button')

    $btnDelete.classList.add('btn', 'btn-outline-danger', 'w-100')
    $btnDelete.textContent = 'Удалить'

    $tdFIO.textContent = `${studObj.lastname} ${studObj.name} ${studObj.surname}`
    $tdFIO.textContent = studObj.fio
    $tdBirthday.textContent = formatAge(new Date(studObj.birthday))
    $tdFaculty.textContent = studObj.faculty
    $tdStudyStart.textContent = formatCourse(studObj.studyStart)

    $btnDelete.addEventListener('click', async function () {
      await serverDeleteStudent(studObj.id);
      const index = listStudents.findIndex(student => student.id === studObj.id);
      if (index > -1) {
        listStudents.splice(index, 1);
      }
      $tr.remove();
      render(listStudents)
    });

    $tdDelete.append($btnDelete)

    $tr.append($tdFIO, $tdBirthday, $tdFaculty, $tdStudyStart, $tdDelete)
    return $tr;
}

 const $fioFilterForm = document.getElementById('filter-form_fio-inp'),
          $facultyFilterForm = document.getElementById('filter-form_faculty-inp'),
          $sortFIOBtn = document.getElementById('sort_fio'),
          $sortBirthdayBtn = document.getElementById('sort_birthday'),
          $sortFacultyBtn = document.getElementById('sort_faculty'),
          $sortStudyBtn = document.getElementById('sort_study')


function filter(arr, prop, value) {
    return  arr.filter(function(oneUser) {
        if (oneUser[prop].includes(value.trim())) return true
    });
}

function render(arr) {
    const $studTable = document.getElementById('stud-table');
    $studTable.innerHTML = ''
    let copyArr = [...arr]

     for (const oneUser of copyArr){
        oneUser.fio = oneUser.name + ' ' + oneUser.surname + ' ' + oneUser.lastname
    }

    copyArr = copyArr.sort(function (a, b) {
        let sort = a[sortColumnFlag] < b[sortColumnFlag]

        if (sortDirFlag === false) sort = a[sortColumnFlag] > b[sortColumnFlag]
        if (sort) return -1
    })


    if ($fioFilterForm.value.trim() !== ""){
        copyArr = filter(copyArr, 'fio', $fioFilterForm.value)
    }
    if ($facultyFilterForm.value.trim() !== ""){
        copyArr = filter(copyArr, 'faculty', $facultyFilterForm.value)
    }

    for (const studObj of copyArr) {
    const $newTr = $getNewStudentTR(studObj)
    $studTable.append($newTr)
    }
}
render(listStudents)

document.getElementById('add-form').addEventListener('submit', async function (e) {
    e.preventDefault()

  const dateOfBirth = new Date(document.getElementById('birthday-inp').value.trim());
  const yearOfStudy = parseInt(document.getElementById('studyStart-inp').value.trim());

  const errors = [];
  const currentYear = new Date().getFullYear();

  if (isNaN(dateOfBirth.getTime())) {
    errors.push('Дата рождения обязательна и должна быть действительной');
  } else if (dateOfBirth < new Date('1900-01-01') || dateOfBirth > new Date()) {
    errors.push('Дата рождения должна быть между 01.01.1900 и текущей датой');
  }
  if (isNaN(yearOfStudy) || yearOfStudy < 2000 || yearOfStudy > currentYear) {
    errors.push(`Годом обучения должно быть число между 2000 годом и ${currentYear}`);
  }

  const errorMessages = document.getElementById('error-messages');
  if (errors.length > 0) {
    errorMessages.innerHTML = errors.map(error => `<p class="error">${error}</p>`).join('');
  }
  else {
    let newStudentObj = {
      name: document.getElementById('name-inp').value,
      lastname: document.getElementById('lastname-inp').value,
      surname: document.getElementById('surname-inp').value,
      birthday: new Date(document.getElementById('birthday-inp').value ) ,
      faculty: document.getElementById('faculty-inp').value,
      studyStart: document.getElementById('studyStart-inp').value,
    }
    let serverDataObj = await serverAddStudent(newStudentObj)
    serverDataObj.birthday = new Date(serverDataObj.birthday)
    listStudents.push(serverDataObj)
    render(listStudents)
    errorMessages.innerHTML = '';
    e.target.reset();
  }
})

$sortFIOBtn.addEventListener('click', function () {
    sortColumnFlag = 'fio'
    sortDirFlag = !sortDirFlag
    render(listStudents)
})
$sortBirthdayBtn.addEventListener('click', function () {
    sortColumnFlag = 'birthday'
    sortDirFlag = !sortDirFlag
    render(listStudents)
})
$sortFacultyBtn.addEventListener('click', function () {
    sortColumnFlag = 'faculty'
     sortDirFlag = !sortDirFlag
    render(listStudents)
})
$sortStudyBtn.addEventListener('click', function () {
    sortColumnFlag = 'studyStart'
     sortDirFlag = !sortDirFlag
    render(listStudents)
})

$fioFilterForm.addEventListener('input', function() {
    render(listStudents)
})
$facultyFilterForm.addEventListener('input', function() {
    render(listStudents)
})


