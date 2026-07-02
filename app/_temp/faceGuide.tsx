type FaceGuideProps = {
  isValid: boolean;
};

export default function FaceGuide({ isValid }: FaceGuideProps) {
  return (
    <div
      className={`
        absolute
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2

        w-64
        h-80

        rounded-3xl
        border-4
        border-dashed
        transition-all
        duration-300

        ${isValid ? "border-green-500" : "border-red-500"}
      `}
    />
  );
}
