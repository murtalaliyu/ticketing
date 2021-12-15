import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // Stop the timer when the user navigates away from the page
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  // for expired orders
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: ${timeLeft} seconds
      <StripeCheckout 
        token={(token) => console.log(token)}
        stripeKey="pk_test_51K6MRoKO0cS0QXukeqNp0AtINxdYdmtaD7C7Jt0guLkSQVopZaUBT52IHXPBm4agGQDfUcclQiL7bD9j13OvP2vA007XkweYAr" // publishable key
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
