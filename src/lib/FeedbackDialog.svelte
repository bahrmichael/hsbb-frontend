<script lang="ts">
  export let show = false;
  export let calculatorInput: string;
  export let appraisalResultJson: string;
  export let onClose = () => show = false;

  let feedbackMessage = '';
  let rating = 5;

  async function submitFeedback() {
    const feedback = {
      feedbackMessage,
      rating,
      calculatorInput,
      appraisalResultJson
    };

    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    });

    feedbackMessage = '';
    rating = 5;
    alert('Thank you!')
    onClose();
  }
</script>

<dialog class="modal" class:modal-open={show}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">How can we improve?</h3>
    <p class="py-4">Your feedback will include the appraisal text and results to help us understand the issue.</p>
    <textarea
      class="textarea textarea-bordered w-full"
      rows="4"
      bind:value={feedbackMessage}
      placeholder="Describe the issue..."></textarea>
    <p class="py-4">How do you rate the current experience?</p>
    <div class="rating rating-lg my-4">
      {#each Array(5) as _, i}
        <input
          type="radio"
          name="rating"
          class="mask mask-star-2 bg-orange-300"
          bind:group={rating}
          value={i + 1}
        />
      {/each}
    </div>
    <div class="modal-action">
      <button class="btn" on:click={onClose}>Cancel</button>
      <button class="btn btn-primary text-gray-100" on:click={submitFeedback}>Submit</button>
    </div>
  </div>
</dialog>
