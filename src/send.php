<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Récupérer les données du formulaire
    $full_name = htmlspecialchars($_POST['full_name']);
    $event_date = htmlspecialchars($_POST['event_date']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $message = htmlspecialchars($_POST['message']);
    $main_hand = htmlspecialchars($_POST['main']);
    $height = htmlspecialchars($_POST['height']);
    $already_handball = htmlspecialchars($_POST['alreadyhandball']);
    $level = isset($_POST['level']) ? htmlspecialchars($_POST['level']) : 'Non précisé';

    // Récupérer les postes préférés (checkbox)
    $positions = isset($_POST['postes']) ? $_POST['postes'] : [];
    $positions_string = implode(", ", $positions);

    // Préparer l'e-mail
    $to = "anto73grillet@gmail.com"; // Remplacez par votre adresse e-mail
    $subject = "Nouvelle inscription au club de handball";
    $body = "
        <h2>Nouvelle inscription</h2>
        <p><strong>Nom complet :</strong> $full_name</p>
        <p><strong>Date de naissance :</strong> $event_date</p>
        <p><strong>Email :</strong> $email</p>
        <p><strong>Téléphone :</strong> $phone</p>
        <p><strong>Remarques :</strong> $message</p>
        <p><strong>Main principale :</strong> $main_hand</p>
        <p><strong>Taille :</strong> $height cm</p>
        <p><strong>A déjà pratiqué le handball :</strong> $already_handball</p>
        <p><strong>Niveau de pratique :</strong> $level</p>
        <p><strong>Postes préférés :</strong> $positions_string</p>
    ";

    $headers = "From: $email\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Envoyer l'e-mail
    if (mail($to, $subject, $body, $headers)) {
        echo "Votre inscription a été envoyée avec succès.";
    } else {
        echo "Erreur lors de l'envoi de votre inscription.";
    }
} else {
    echo "Méthode de requête invalide.";
}
?>