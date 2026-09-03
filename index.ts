interface Describe {
  (description: string, fn: Function): void
}

interface It {
  (description: string, fn: Function): void
}

export default function initialize(config: {
  describe: Describe,
  it: It
}) {
  const scenario = make_scenario(config)
  const given = make_given()
  const when = make_when()
  const then = make_then()
  const and = make_and()

  return { scenario, given, when, then, and }
}

type MetaData = {
  label: string;
};

type Given<T> = GivenStep<T> | GivenSuchAsStep<T>

type GivenStep<GivenReturnType> = {
  kind: "given";
  label: string;
  fn: (_: never) => GivenReturnType;
};

type GivenSuchAsStep<GivenSuchAsReturnType> = {
  kind: "given_such_as";
  label: string;
  fn: (_: never) => Readonly<GivenSuchAsReturnType[]>;
};

type WhenStep<GivenReturnType, WhenReturnType> = {
  kind: "when";
  label: string;
  fn: (args: { input: GivenReturnType }) => WhenReturnType;
};

type ThenStep<WhenReturnTYpe, GivenReturnType> = {
  kind: "then";
  label: string;
  fn: (args: { result: WhenReturnTYpe, input: GivenReturnType }) => void;
};

type AndStep<WhenReturnType, GivenReturnType> = {
  kind: "and_also";
  label: string;
  fn: (args: { result: WhenReturnType, input: GivenReturnType }) => void;
};

function template_label(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  return String.raw({ raw: strings }, ...values);
}

function make_given() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    const given = <GivenReturnType>(
      fn: (_: never) => GivenReturnType,
    ): GivenStep<GivenReturnType> & MetaData => ({
      kind: "given",
      label,
      fn,
    });

    given.such_as = <GivenSuchAsReturnType>(
      fn: (_: never) => Readonly<GivenSuchAsReturnType[]>,
    ): GivenSuchAsStep<GivenSuchAsReturnType> & MetaData => ({
      kind: "given_such_as",
      label,
      fn,
    });

    return given;
  };
}

function make_when() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <GivenReturnType, WhenReturnType>(
      fn: (args: { input: GivenReturnType }) => WhenReturnType,
    ): WhenStep<GivenReturnType, WhenReturnType> & MetaData => ({
      kind: "when",
      label,
      fn,
    });
  };
}

function make_then() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <WhenReturnType, GivenReturnType>(
      fn: (args: { result: WhenReturnType, input: GivenReturnType }) => void,
    ): ThenStep<WhenReturnType, GivenReturnType> & MetaData => ({
      kind: "then",
      label,
      fn,
    });
  };
}

function make_and() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <WhenOutput, GivenInput>(
      fn: (args: { result: WhenOutput, input: GivenInput }) => void,
    ): AndStep<WhenOutput, GivenInput> & MetaData => ({
      kind: "and_also",
      label,
      fn,
    });
  };
}

type GivenValue<G> =
  G extends GivenStep<infer T>
  ? T
  : G extends GivenSuchAsStep<infer T>
  ? T
  : never;

function make_scenario(config: { describe: Describe, it: It }) {

  const { describe, it } = config

  return function scenario(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) {
    const title = template_label(strings, values);

    return function register_scenario<
      G extends Given<any> & MetaData,
      Z,
    >(
      given: G,
      when: WhenStep<GivenValue<G>, Z> & MetaData,
      then: ThenStep<Z, GivenValue<G>> & MetaData,
      ...ands: AndStep<Z, GivenValue<G>>[]
    ) {

      describe(`SCENARIO: ${title}`, () => {


        if (given.kind === "given_such_as") {
          const given_inputs = given.fn(undefined as never);

          for (const given_single_input of given_inputs) {
            describe(`GIVEN ${given.label}`, () => {
              describe(`WHEN ${when.label}`, () => {
                const when_result = when.fn({ input: given_single_input });

                it(`THEN ${then.label}`, () => {
                  then.fn({ result: when_result, input: given_single_input });
                })

                for (const and of ands) {
                  it(`AND ${and.label}`, () => {
                    and.fn({ result: when_result, input: given_single_input })
                  })
                }
              })
            })

          } return
        }


        if (given.kind === "given") {
          const given_input = given.fn(undefined as never);

          describe(`GIVEN ${given.label}`, () => {
            describe(`WHEN ${when.label}`, () => {
              const when_result = when.fn({ input: given_input });

              it(`THEN ${then.label}`, () => {
                then.fn({ result: when_result, input: given_input });
              })

              for (const and of ands) {
                it(`AND ${and.label}`, () => {
                  and.fn({ result: when_result, input: given_input })
                })
              }
            })
          })
          return
        }

      })
    };
  }
}
