// Create new user
$("#register").submit((event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  console.log("reg submit fired");
  const newInfo = {};
  let email = "";

  $("#register")
    .find("input")
    .each((i, e) => {
      if (e.name !== "submit") {
        newInfo[e.name] = e.value;
      }
    });
  $.ajax({
    url: "/api/users",
    type: "POST",
    data: JSON.stringify(newInfo),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (result) => {
      console.log("user POST on register success ", result);
      email = result.email;
      const { name } = result;
      $("#emails").prepend(`<h2>Connected user: ${email}</h2>`);
      alert(`Thanks ${name}.`);
    },
  });

  $("#register-login").hide();
  $("#emails").show();

  $("get-email").click(newMails(email));

  $("#email-form").submit((event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    sendEmail(email);
  });
});

// Present returning user with their emails
$("#login").submit((event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  console.log("login submit fired");
  const userInfo = {};

  $("#login")
    .find("input")
    .each((i, e) => {
      if (e.name !== "submit") {
        userInfo[e.name] = e.value;
      }
    });
  console.log("userInfo", userInfo);
  const URL = `/api/emails/${userInfo["email"]}`;
  $.get(URL, (result) => {
    console.log("email GET on login success", result);
    $("#emails").prepend(`<h2>Connected user: ${userInfo["email"]}</h2>`);
    for (let i = 0; i < result.length; i++) {
      const $listing = $(
        `<div id='listing' 
        class='card' 
        style='border: 2px solid black; margin: 2px; padding: 2px;'>
        Email #${i + 1}
        </div>`
      );
      const { subject, body, sender } = result[i];
      $(`<h4>${subject}</h4>`).appendTo($listing);
      $(`<h5>From: ${sender}</h5>`).appendTo($listing);
      $(`<p>${body}</p>`).appendTo($listing);
      $listing.appendTo("#history");
    }
  });

  $("#register-login").hide();
  $("#emails").show();

  $("get-email").click(newMails(userInfo.email));

  $("#email-form").submit((event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    sendEmail(userInfo["email"]);
  });
});

// Helper Functions
// Post the email user creates to server
const sendEmail = (email) => {
  // event.preventDefault();
  console.log("send email submit event fired");

  const metadata = {};

  $("#email-form")
    .find("[placeholder]")
    .each((i, e) => {
      if (e.name !== "submit") {
        metadata[e.name] = e.value;
      }
    });
  metadata.email = email;
  console.log(metadata);
  $.ajax({
    url: "/api/emails",
    type: "POST",
    data: JSON.stringify(metadata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (result) => {
      console.log("email POST on submit success");
      const { subject, body } = result;
      alert(`Sent email "${subject}" with body "${body}".`);
    },
  });
};

// Get new emails
const newMails = (email) => {
  $("#history").empty();
  const URL = `/api/emails/${email}`;
  $.get(URL, (result) => {
    console.log("email GET success", result);
    for (let i = 0; i < result.length; i++) {
      const $listing = $(
        `<div id='listing' 
        class='card' 
        style='border: 2px solid black; margin: 2px; padding: 2px;'>
        Email #${i + 1}
        </div>`
      );
      const { subject, body, sender } = result[i];
      $(`<h4>${subject}</h4>`).appendTo($listing);
      $(`<h5>From: ${sender}</h5>`).appendTo($listing);
      $(`<p>${body}</p>`).appendTo($listing);
      $listing.appendTo("#history");
    }
  });
};
