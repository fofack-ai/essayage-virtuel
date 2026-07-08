const axios = require("axios");

/**
 * Service d'intégration Paydunya (Orange Money & MTN Mobile Money).
 *
 * Flux :
 *  1. createInvoice()  -> crée une facture chez Paydunya, renvoie une URL de paiement
 *  2. le client paie sur la page Paydunya (hors de notre site)
 *  3. Paydunya appelle notre callback OU on vérifie via confirmInvoice()
 *  4. confirmInvoice() -> vérifie le vrai statut du paiement auprès de Paydunya
 *
 * IMPORTANT : on ne fait JAMAIS confiance au navigateur du client pour dire
 * "j'ai payé". On vérifie toujours directement auprès de Paydunya.
 */

// Mode test (sandbox) ou production (live), piloté par le .env
const IS_LIVE = process.env.PAYDUNYA_MODE === "live";

const BASE_URL = IS_LIVE
  ? "https://app.paydunya.com/api/v1"
  : "https://app.paydunya.com/sandbox-api/v1";

// Les en-têtes d'authentification Paydunya (les 4 clés depuis le .env)
function headers() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
  };
}

/**
 * Crée une facture de paiement chez Paydunya.
 * Renvoie { token, paymentUrl } : le token sert à vérifier plus tard,
 * l'URL est celle vers laquelle on redirige le client pour qu'il paie.
 */
async function createInvoice({ orderId, orderNumber, amount, customer }) {
  if (!process.env.PAYDUNYA_MASTER_KEY) {
    throw new Error("Clés Paydunya absentes du .env — paiement en ligne indisponible");
  }

  const payload = {
    invoice: {
      total_amount: amount,
      description: `Commande ${orderNumber} — TryOn`,
    },
    store: {
      name: "TryOn",
      tagline: "Mode africaine & essayage virtuel",
    },
    // custom_data : nos propres infos, renvoyées telles quelles par Paydunya.
    // On y met l'id de commande pour retrouver la commande au moment du callback.
    custom_data: {
      orderId: String(orderId),
      orderNumber: orderNumber,
    },
    actions: {
      // URL que Paydunya appelle en arrière-plan quand le paiement change de statut
      callback_url: `${process.env.BACKEND_URL}/api/v1/payments/paydunya/callback`,
      // Où revient le client après avoir payé / annulé
      return_url: `${process.env.FRONTEND_URL}/order-success?order=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=1`,
    },
  };

  // Pré-remplir les infos client sur la page Paydunya (plus fluide)
  if (customer) {
    payload.invoice.customer = {
      name: customer.name || "Client TryOn",
      email: customer.email || "",
      phone: customer.phone || "",
    };
  }

  const { data } = await axios.post(
    `${BASE_URL}/checkout-invoice/create`,
    payload,
    { headers: headers(), timeout: 30000 }
  );

  // response_code "00" = succès chez Paydunya
  if (data.response_code !== "00") {
    throw new Error(`Paydunya a refusé la création de facture : ${data.response_text}`);
  }

  return {
    token: data.token,
    paymentUrl: data.response_text, // c'est l'URL de la page de paiement
  };
}

/**
 * Vérifie le vrai statut d'un paiement auprès de Paydunya, via son token.
 * Renvoie le statut : "completed", "pending", "cancelled" ou "failed".
 * C'est LA source de vérité — on l'appelle depuis le callback.
 */
async function confirmInvoice(token) {
  const { data } = await axios.get(
    `${BASE_URL}/checkout-invoice/confirm/${token}`,
    { headers: headers(), timeout: 30000 }
  );

  if (data.response_code !== "00") {
    throw new Error(`Paydunya : vérification impossible (${data.response_text})`);
  }

  // status possible : completed, pending, cancelled, failed
  return {
    status: data.status,
    orderId: data.invoice?.custom_data?.orderId || null,
    amount: data.invoice?.total_amount || null,
    customer: data.customer || null,
  };
}

module.exports = { createInvoice, confirmInvoice };