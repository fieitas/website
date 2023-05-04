default: help;

run: ## run hlx up
	@hlx up

lint: ## run code linter
	@npm run lint

lint-fix: ## let the linter try to fix issue
	@npx eslint ./ --ext .js --fix


help: ## Show this help
	@egrep '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST)  | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m·%-20s\033[0m %s\n", $$1, $$2}'