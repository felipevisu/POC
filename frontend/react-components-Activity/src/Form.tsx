function Form() {
  return (
    <form>
      <h2>Contact</h2>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" />
      </div>
      <div>
        <label htmlFor="subject">Subject</label>
        <input type="text" name="subject" />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea name="message" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default Form;
