<?php

include 'connect.php';

if (isset($_POST['signUp'])) {
    $firstName = $_POST['fname']; // Fixed typo in variable name
    $lastName = $_POST['lname']; // Corrected the variable reference
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password = md5($password); // Hash the password using MD5

    // Check if the email already exists
    $checkEmail = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($checkEmail);

    if ($result->num_rows > 0) {
        echo "Email Address Already Exists!";
    } else {
        // Insert new user
        $insertQuery = "INSERT INTO users (firstName, lastName, email, password)
                        VALUES ('$firstName', '$lastName', '$email', '$password')";
        if ($conn->query($insertQuery) === TRUE) {
            header("Location: page1.php");
            exit();
        } else {
            echo "Error: " . $conn->error;
        }
    }
}

if (isset($_POST['signIn'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password = md5($password); // Hash the password to compare

    $sql = "SELECT * FROM users WHERE email = '$email' AND password = '$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        session_start();
        $row = $result->fetch_assoc();
        $_SESSION['email'] = $row['email'];
        header("Location: page2.php");
        exit();
    } else {
        echo "Incorrect Email or Password";
    }
}

?>

