export const util = {
  nameValidation(fname, lname, err) {
    if (!/^[a-zA-Z\s]+$/.test(fname)) {
      err.innerText = "Please enter a valid first name.";
      err.classList.remove("hidden");
      err.style.opacity = "1";
      setTimeout(() => {
        err.style.opacity = "0";
        setTimeout(() => err.classList.add("hidden"), 500); // hide after fade
      }, 2000);
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(lname)) {
      err.innerText = "Please enter a valid last name.";
      err.classList.remove("hidden");
      err.style.opacity = "1";
      setTimeout(() => {
        err.style.opacity = "0";
        setTimeout(() => err.classList.add("hidden"), 500); // hide after fade
      }, 2000);
      return false;
    }
    return true;
  },

  sizeValidation(size, err) {
    if (!size) {
      err.innerText = "Please select a size.";
      err.classList.remove('hidden');
      err.style.opacity = '1';
      setTimeout(() => {
            err.classList.add('hidden');
        }, 2000);
       return false;
    } else {
          return true;
    }

  },

  phoneValidation(phone, err) {
    if (!/^\d+$/.test(phone)) {
      err.innerText = "Please enter a valid phone number.";
      err.classList.remove("hidden");
      err.style.opacity = "1";
      setTimeout(() => {
        err.style.opacity = "0";
        setTimeout(() => err.classList.add("hidden"), 500); // hide after fade
      }, 2000);
      return false;
    }

    if (!phone.startsWith("09")) {
      err.innerText = "Please enter a valid phone number starts with 09.";
      err.classList.remove("hidden");
      err.style.opacity = "1";
      setTimeout(() => {
        err.style.opacity = "0";
        setTimeout(() => err.classList.add("hidden"), 500); // hide after fade
      }, 2000);
      return false;
    }

    if (phone.length !== 11) {
      err.innerText = "Please enter your 11 digits phone number.";
      err.classList.remove("hidden");
      err.style.opacity = "1";
      setTimeout(() => {
        err.style.opacity = "0";
        setTimeout(() => err.classList.add("hidden"), 500); // hide after fade
      }, 2000);
      return false;
    }
    return true;
  },
};
