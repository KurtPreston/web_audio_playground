import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ],
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none'
        }
      ],
      '@typescript-eslint/prefer-function-type': 'off',
      'prefer-const': [
        'error',
        {
          destructuring: 'all'
        }
      ]
    }
  },
  {
    ignores: ['**/*.generated.ts']
  }
);
