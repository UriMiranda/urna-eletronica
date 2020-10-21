const votingSession = [
  {
    name: "Presidente",
    ballot: "president",
    numbersLength: 2,
    candidates: [
      {
        name: "Lula",
        id: "13",
        party: "PT",
        photo: "/images/lula.jpg",
        vice: { name: "Vice do Lula", photo: null },
      },
      {
        name: "Bolsonaro",
        id: "17",
        party: "PSL",
        photo: "/images/bolsonaro.jpg",
        vice: { name: "Vice do Bolsonaro", photo: null },
      },
      {
        name: "Boulos",
        id: "50",
        party: "PSOL",
        photo: "/images/boulos.jpg",
        vice: { name: "Vice do Boulos", photo: null },
      },
    ],
  },
  {
    name: "Deputado Federal",
    ballot: "congressman",
    numbersLength: 4,
    candidates: [
      { name: "José", id: "1387", party: "PT", photo: null },
      { name: "Maria", id: "1762", party: "PSL", photo: null },
      { name: "Ricardo", id: "5085", party: "PSOL", photo: null },
    ],
  },
];

const Voting = (function Voting() {
  const vm = this;
  vm.position = 0;
  vm.voteNumbers = $('input[name="CandidateNumber[]"]');
  vm.end = false;
  vm.isLoading = true;
  vm.voting = [];
  vm.votingStep = null;
  vm.votingStepIndex = 0;
  vm.currentCandidate = null;
  vm.confirm = false;
  vm.votes = [];

  vm.fillNumberInput = function (event) {
    event.preventDefault();
    const target = $(event.target);
    const value = target.data("value");
    if (vm.position > vm.voteNumbers.length) return;
    const numberInput = vm.voteNumbers.get(vm.position);
    if (!numberInput) return;
    numberInput.value = value;
    vm.position++;
  };

  vm.undoVote = function (event) {
    event.preventDefault();
    vm.position = 0;
    vm.confirm = false;
    vm.voteNumbers.val("");
    vm.votingStepIndex = --vm.votingStepIndex;
    vm.nextRoleToVote();
  };

  vm.blankVote = function (event) {
    event.preventDefault();
    $(".screen").hide();
    vm.position = 0;
    vm.confirm = true;
    $("#BlankVoteScreen").show();
  };

  vm.confirmVote = function (event) {
    event.preventDefault();
    $(".screen").hide();
    if (vm.confirm) {
      vm.confirm = false;
      const candidate = vm.searchByCandidate();
      const voting = vm.voting[vm.votingStepIndex];
      vm.votes[voting.ballot] = candidate;
      if (vm.votingStepIndex >= vm.voting.length - 1) {
        vm.turnOffEvents();
        vm.onEndVoting();
        return $("#EndVotingScreen").show();
      }
      return vm.nextRoleToVote();
    }
    vm.confirm = true;

    const number = vm.getVoteNumber().join("");
    if (!number.length) return $("#BlankVoteScreen").show();
    const candidate = vm.searchByCandidate();
    if (!candidate) return $("#BlankVoteScreen").show();

    $("#EnteredCandidateNumber").html(
      vm.getVoteNumber().map(function (value) {
        return "<span>" + value + "</span>";
      })
    );

    $("#CandidateName").text(candidate.name);
    $("#CandidateParty").text(candidate.party);

    if (candidate.photo && candidate.photo !== "")
      $("#CandidatePhoto").attr("src", candidate.photo);
    else $("#CandidatePhoto").attr("src", "images/person-placeholder.png");

    if (candidate.vice) {
      $("#ViceCandidateName").text(candidate.vice.name);
      $(".CandidateViceItems").show();
      if (candidate.vice.photo && candidate.vice.photo !== "")
        $("#ViceCandidatePhoto").attr("src", candidate.photo);
      else
        $("#ViceCandidatePhoto").attr("src", "images/person-placeholder.png");
    } else $(".CandidateViceItems").hide();

    $("#ResultVoteScreen").show();
    $(".NumberButton").off("click", vm.fillNumberInput);
  };

  vm.getVoteNumber = function () {
    return vm.voteNumbers.get().map(function (i) {
      return i ? i.value : "";
    });
  };

  vm.searchByCandidate = function () {
    const number = vm.getVoteNumber().join("");
    const voting = vm.voting[vm.votingStepIndex];
    const candidate = voting.candidates.find((c) => c.id == number);
    return candidate;
  };

  vm.turnOnEvents = function () {
    $(".NumberButton").on("click", vm.fillNumberInput);
    $("#UndoButton").on("click", vm.undoVote);
    $("#BlankVoteButton").on("click", vm.blankVote);
    $("#ApplyVoteButton").on("click", vm.confirmVote);
  };

  vm.turnOffEvents = function () {
    $(".NumberButton").off("click", vm.fillNumberInput);
    $("#UndoButton").off("click", vm.undoVote);
    $("#BlankVoteButton").off("click", vm.blankVote);
    $("#ApplyVoteButton").off("click", vm.confirmVote);
  };

  vm.fetchVoting = function () {
    return new Promise((resolve) => resolve(votingSession));
  };

  vm.goToRoleVote = function (index) {
    const voting = vm.voting[index];
    $(".CandidateTitle").text(voting.name);
    $("#CandidateNumberInputs").html("");
    for (let i = 0; i < voting.numbersLength; i++) {
      $("#CandidateNumberInputs").append(
        '<input readonly name="CandidateNumber[]" />'
      );
    }
    vm.voteNumbers = $('input[name="CandidateNumber[]"]');
    vm.position = 0;
    $(".screen").hide();
    $("#VoteScreen").show();
  };

  vm.nextRoleToVote = function () {
    $(".NumberButton").off("click", vm.fillNumberInput);
    $(".NumberButton").on("click", vm.fillNumberInput);
    vm.votingStepIndex = vm.votingStepIndex + 1;
    vm.goToRoleVote(vm.votingStepIndex);
  };

  vm.onEndVoting = function () {
    const votes = vm.votes;
    console.log(votes);
    // TODO: Enviar votos para o servidor
  };

  (function () {
    vm.fetchVoting()
      .then(function (voting) {
        vm.voting = voting;
        vm.goToRoleVote(0);
        vm.turnOnEvents();
        vm.isLoading = false;
      })
      .catch(function (err) {
        vm.isLoading = false;
      });
  })();

  return vm;
})();
