import { showToast } from "../toast.js";

export const util = {
  nameValidation(fname, lname) {
    if (!/^[a-zA-Z\s]+$/.test(fname)) {
      showToast("Please enter a valid first name.", "error")
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(lname)) {
      showToast("Please enter a valid last name.", "error")
      return false;
    }
    return true;
  },

  sizeValidation(size) {
    if (!size) {
      showToast('Please select the size', "error");
       return false;
    } else {
          return true;
    }

  },

    dateValidation(selecedDate) {
    if (!selecedDate) {
      showToast('Please select date of the appointment', "error");
       return false;
    } else {
          return true;
    }

  },

  timeValidation(time) {
    if (!time) {
      showToast('Please select the time', "error");
       return false;
    } else {
          return true;
    }

  },

 typeValidation(type) {
  if (!type) {
    showToast("Please select a service type.", "error");
    return false;
  }
  return true;
},

  phoneValidation(phone) {
    if (!/^\d+$/.test(phone)) {
      showToast("Please enter a valid phone number.", "error");
      return false;
    }

    if (!phone.startsWith("09")) {
      showToast("Please enter a valid phone number starts with 09.", "error");
      return false;
    }

    if (phone.length !== 11) {
      showToast("Please enter your 11 digits phone number.", "error");
      return false;
    }
    return true;
  },
};
